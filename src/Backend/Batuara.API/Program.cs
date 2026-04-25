using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Batuara.Application.Auth.Services;
using Batuara.Application.Calendar.Services;
using Batuara.Application.Common.Mappings;
using Batuara.Application.ContactMessages.Services;
using Batuara.Application.Events.Services;
using Batuara.Application.Guides.Services;
using Batuara.Application.HouseMembers.Services;
using Batuara.Application.Orixas.Services;
using Batuara.Application.SiteSettings.Services;
using Batuara.Application.SpiritualContents.Services;
using Batuara.Application.UmbandaLines.Services;
using Batuara.API.Middleware;
using Batuara.Domain.Repositories;
using Batuara.Domain.Services;
using Batuara.Infrastructure.Auth.Services;
using Batuara.Infrastructure.Calendar.Services;
using Batuara.Infrastructure.ContactMessages.Services;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.Data.Repositories;
using Batuara.Infrastructure.Data.SeedData;
using Batuara.Infrastructure.Events.Services;
using Batuara.Infrastructure.Guides.Services;
using Batuara.Infrastructure.HouseMembers.Services;
using Batuara.Infrastructure.Orixas.Services;
using Batuara.Infrastructure.SiteSettings.Services;
using Batuara.Infrastructure.SpiritualContents.Services;
using Batuara.Infrastructure.UmbandaLines.Services;
using Serilog;
using Serilog.Events;
using Serilog.Formatting.Json;
using Batuara.Application.Dashboard.Services;
using Batuara.Infrastructure.Dashboard.Services;

using FluentValidation;
using FluentValidation.AspNetCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using System.Text.Json;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog with structured logging
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "Batuara.API")
    .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
    .Enrich.WithProperty("MachineName", Environment.MachineName)
    .Enrich.WithProperty("ProcessId", Environment.ProcessId)
    .WriteTo.Console(new JsonFormatter(renderMessage: true))
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Add HttpContextAccessor for request enrichment
builder.Services.AddHttpContextAccessor();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Configure FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddValidatorsFromAssemblyContaining<MappingProfile>();

// Configure CORS using allowed origins from configuration
var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowProxy", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
        else
        {
            // Fallback for development only
            policy.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        }
    });
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var jwtSecret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");

// Validate JWT Secret strength
if (jwtSecret.Contains("CHANGE_ME") || jwtSecret.Contains("your-256-bit-secret") || jwtSecret == string.Empty)
{
    if (builder.Environment.IsProduction())
    {
        throw new InvalidOperationException(
            "JWT Secret is a placeholder. Set a strong secret via environment variable JwtSettings__Secret or JWT_SECRET. " +
            "Generate one with: openssl rand -base64 64");
    }
    Log.Warning("JWT Secret is a placeholder. This is acceptable in Development but MUST be changed in Production. " +
        "Generate a strong secret with: openssl rand -base64 64");
}

if (jwtSecret.Length < 32)
{
    throw new InvalidOperationException(
        $"JWT Secret must be at least 32 characters long (current: {jwtSecret.Length}). " +
        "Generate a strong secret with: openssl rand -base64 64");
}

var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = builder.Environment.IsProduction();
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
            {
                context.Response.Headers["Token-Expired"] = "true";
            }
            return Task.CompletedTask;
        }
    };
});

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Batuara API", Version = "v1" });
    
    // Configure Swagger to use JWT Authentication
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure Database
builder.Services.AddDbContext<BatuaraDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "batuara")));

// Configure AutoMapper
builder.Services.AddAutoMapper(cfg => {
    cfg.AddProfile<MappingProfile>();
});

// Configure Options
builder.Services.Configure<JwtSettings>(jwtSettings);
builder.Services.Configure<PasswordRequirements>(
    builder.Configuration.GetSection("SecuritySettings:PasswordRequirements"));

// Register Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Register Services
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISiteSettingsService, SiteSettingsService>();
builder.Services.AddScoped<IGuideService, GuideService>();
builder.Services.AddScoped<IHouseMemberService, HouseMemberService>();
builder.Services.AddScoped<IContactMessageService, ContactMessageService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IEventDomainService, EventDomainService>();
builder.Services.AddScoped<IOrixaService, OrixaService>();
builder.Services.AddScoped<ICalendarAttendanceService, CalendarAttendanceService>();
builder.Services.AddScoped<ICalendarDomainService, CalendarDomainService>();
builder.Services.AddScoped<IUmbandaLineService, UmbandaLineService>();
builder.Services.AddScoped<ISpiritualContentService, SpiritualContentService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    var isDevelopment = builder.Environment.IsDevelopment();

    // Login endpoint: 5 requests per minute
    options.AddPolicy("login", context =>
    {
        var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            key,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = isDevelopment ? 60 : 5,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            });
    });

    // Token refresh: 10 requests per minute
    options.AddPolicy("refresh", context =>
    {
        var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            key,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = isDevelopment ? 120 : 10,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            });
    });

    // General API: 100 requests per minute per IP
    options.AddPolicy("general", context =>
    {
        var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            key,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = isDevelopment ? 2000 : 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 2
            });
    });

    options.AddPolicy("public", context =>
    {
        var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            key,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromHours(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            });
    });

    options.AddPolicy("authenticated", context =>
    {
        var userKey = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? context.User.FindFirst("sub")?.Value
            ?? context.Connection.RemoteIpAddress?.ToString()
            ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(
            userKey,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 1000,
                Window = TimeSpan.FromHours(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            });
    });
});

// Configure Health Checks
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddHealthChecks()
    .AddNpgSql(
        connectionString ?? throw new InvalidOperationException("DefaultConnection not configured"),
        name: "postgresql",
        timeout: TimeSpan.FromSeconds(5),
        tags: Program.HealthCheckTags);

var app = builder.Build();

app.UseForwardedHeaders();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

// Configure PathBase for Nginx Proxy
app.UsePathBase("/batuara-api");

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/batuara-api/swagger/v1/swagger.json", "Batuara API V1");
    c.RoutePrefix = "swagger";
});

// Security headers
app.UseMiddleware<SecurityHeadersMiddleware>();

app.UseHttpsRedirection();
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {HttpMethod} {Endpoint} responded {StatusCode} in {Elapsed:0.0000} ms";
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
        diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.ToString());
        diagnosticContext.Set("ClientIP", httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");
        diagnosticContext.Set("Scheme", httpContext.Request.Scheme);
        
        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            var userId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                         ?? httpContext.User.FindFirst("sub")?.Value;
            if (!string.IsNullOrWhiteSpace(userId))
            {
                diagnosticContext.Set("AuthenticatedUserId", userId);
            }
        }
    };
});

app.UseCors("AllowProxy");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            timestamp = DateTime.UtcNow,
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                duration = e.Value.Duration.TotalMilliseconds
            })
        });
        await context.Response.WriteAsync(result);
    }
});

// Redirect root to Swagger
app.MapGet("/", async context =>
{
    context.Response.Redirect("/swagger");
    await Task.CompletedTask;
});

// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<BatuaraDbContext>();
        static bool GetBoolEnv(string name, bool defaultValue)
        {
            var raw = Environment.GetEnvironmentVariable(name);
            if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
            return raw.Trim().Equals("1", StringComparison.OrdinalIgnoreCase)
                || raw.Trim().Equals("true", StringComparison.OrdinalIgnoreCase)
                || raw.Trim().Equals("yes", StringComparison.OrdinalIgnoreCase)
                || raw.Trim().Equals("y", StringComparison.OrdinalIgnoreCase);
        }

        static async Task<int> GetTableCountAsync(BatuaraDbContext dbContext, string schema, CancellationToken cancellationToken)
        {
            var connection = dbContext.Database.GetDbConnection();
            var shouldClose = connection.State != System.Data.ConnectionState.Open;
            if (shouldClose)
            {
                await connection.OpenAsync(cancellationToken);
            }

            try
            {
                using var cmd = connection.CreateCommand();
                cmd.CommandText = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = @schema AND table_type = 'BASE TABLE';";
                var p = cmd.CreateParameter();
                p.ParameterName = "@schema";
                p.Value = schema;
                cmd.Parameters.Add(p);

                var result = await cmd.ExecuteScalarAsync(cancellationToken);
                return Convert.ToInt32(result);
            }
            finally
            {
                if (shouldClose)
                {
                    await connection.CloseAsync();
                }
            }
        }

        var applyMigrations = app.Environment.IsDevelopment() || GetBoolEnv("DB_APPLY_MIGRATIONS_ON_STARTUP", false);
        var seedOnStartup = app.Environment.IsDevelopment() || GetBoolEnv("DB_SEED_ON_STARTUP", false);
        var seedSchema = Environment.GetEnvironmentVariable("DB_SCHEMA")?.Trim();
        if (string.IsNullOrWhiteSpace(seedSchema))
        {
            seedSchema = "batuara";
        }

        if (applyMigrations)
        {
            await context.Database.MigrateAsync();
        }

        if (seedOnStartup)
        {
            var tableCount = await GetTableCountAsync(context, seedSchema, CancellationToken.None);
            if (tableCount == 0)
            {
                await SeedData.Initialize(services);
                await context.SeedBatuaraDataAsync(services.GetRequiredService<ILogger<BatuaraDbContext>>());
            }
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or initializing the database.");
    }
}

app.Run();

partial class Program
{
    public static readonly string[] HealthCheckTags = ["db", "ready"];
}
