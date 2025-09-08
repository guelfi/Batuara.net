Run dotnet test --no-build --configuration Release --verbosity normal
Build started 09/08/2025 23:18:29.
     1>Project "/home/runner/work/Batuara.net/Batuara.net/Batuara.sln" on node 1 (VSTest target(s)).
     1>ValidateSolutionConfiguration:
         Building solution configuration "Release|Any CPU".
Test run for /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/bin/Release/net8.0/Batuara.Domain.Tests.dll (.NETCoreApp,Version=v8.0)
VSTest version 17.11.1 (x64)

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.
Test run for /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Application.Tests/bin/Release/net8.0/Batuara.Application.Tests.dll (.NETCoreApp,Version=v8.0)
Test run for /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Infrastructure.Tests/bin/Release/net8.0/Batuara.Infrastructure.Tests.dll (.NETCoreApp,Version=v8.0)
VSTest version 17.11.1 (x64)

VSTest version 17.11.1 (x64)

Test run for /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.API.Tests/bin/Release/net8.0/Batuara.API.Tests.dll (.NETCoreApp,Version=v8.0)
VSTest version 17.11.1 (x64)

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.
Starting test execution, please wait...
Starting test execution, please wait...
A total of 1 test files matched the specified pattern.
A total of 1 test files matched the specified pattern.
[xUnit.net 00:00:00.00] xUnit.net VSTest Adapter v2.5.3.1+6b60a9e56a (64-bit .NET 8.0.19)
[xUnit.net 00:00:00.13]   Discovering: Batuara.Domain.Tests
[xUnit.net 00:00:00.26]   Discovered:  Batuara.Domain.Tests
[xUnit.net 00:00:00.27]   Starting:    Batuara.Domain.Tests
     Warning:
     The component "Fluent Assertions" is governed by the rules defined in the Xceed License Agreement and
     the Xceed Fluent Assertions Community License. You may use Fluent Assertions free of charge for
     non-commercial use only. An active subscription is required to use Fluent Assertions for commercial use.
     Please contact Xceed Sales mailto:sales@xceed.com to acquire a subscription at a very low cost.
     A paid commercial license supports the development and continued increasing support of
     Fluent Assertions users under both commercial and community licenses. Help us
     keep Fluent Assertions at the forefront of unit testing.
     For more information, visit https://xceed.com/products/unit-testing/fluent-assertions/
[xUnit.net 00:00:00.00] xUnit.net VSTest Adapter v2.5.3.1+6b60a9e56a (64-bit .NET 8.0.19)
[xUnit.net 00:00:00.00] xUnit.net VSTest Adapter v2.5.3.1+6b60a9e56a (64-bit .NET 8.0.19)
HasTimeConflict direct call: False
New Event: 09/15/2025 00:00:00 19:00:00-21:00:00
Existing Event: 09/15/2025 00:00:00 20:00:00-22:00:00
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenOneEventIsInactive_ShouldReturnFalse [36 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.ValidateEventBusinessRules_WhenFestaWithShortDuration_ShouldReturnInvalid [1 ms]
  Passed Batuara.Domain.Tests.Specifications.EventSpecificationsTests.EventsByMonthSpecification_ShouldReturnEventsFromSpecificMonth [34 ms]
  Passed Batuara.Domain.Tests.Specifications.EventSpecificationsTests.EventsThisMonthSpecification_ShouldReturnEventsFromCurrentMonth [1 ms]
  Passed Batuara.Domain.Tests.Specifications.EventSpecificationsTests.IsSatisfiedBy_ShouldWorkCorrectly [< 1 ms]
  Passed Batuara.Domain.Tests.Specifications.EventSpecificationsTests.ActiveEventsSpecification_ShouldReturnOnlyActiveEvents [< 1 ms]
  Passed Batuara.Domain.Tests.Specifications.EventSpecificationsTests.EventsByTypeSpecification_ShouldReturnEventsOfSpecificType [20 ms]
  Passed Batuara.Domain.Tests.Specifications.EventSpecificationsTests.UpcomingEventsSpecification_ShouldReturnOnlyUpcomingActiveEvents [1 ms]
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenEndTimeIsInvalid_ShouldThrowArgumentException(hours: 24) [89 ms]
[xUnit.net 00:00:00.58]     Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenEventsOverlap_ShouldReturnTrue [FAIL]
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenEndTimeIsInvalid_ShouldThrowArgumentException(hours: 25) [1 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.Event_WhenCreatedWithInvalidDescription_ShouldThrowArgumentException(invalidDescription: null) [90 ms]
[xUnit.net 00:00:00.59]     Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WithOverlappingTimes_ShouldReturnTrue [FAIL]
[xUnit.net 00:00:00.59]     Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenEndTimeIsInvalid_ShouldThrowArgumentException(hours: -1) [FAIL]
  Passed Batuara.Domain.Tests.Entities.EventTests.Event_WhenCreatedWithInvalidDescription_ShouldThrowArgumentException(invalidDescription: "   ") [3 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.Event_WhenCreatedWithInvalidDescription_ShouldThrowArgumentException(invalidDescription: "") [< 1 ms]
[xUnit.net 00:00:00.60]     Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenOneEventIsAllDay_ShouldReturnTrue [FAIL]
  Passed Batuara.Domain.Tests.Entities.EventTests.Event_WhenCreatedWithInvalidTitle_ShouldThrowArgumentException(invalidTitle: "") [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.Event_WhenCreatedWithInvalidTitle_ShouldThrowArgumentException(invalidTitle: null) [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.Event_WhenCreatedWithInvalidTitle_ShouldThrowArgumentException(invalidTitle: "   ") [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.RescheduleAttendance_WhenCalledWithoutTimeRange_ShouldThrowArgumentException [11 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.UpdateCapacity_WhenCalledWithInvalidCapacity_ShouldThrowArgumentException(invalidCapacity: 0) [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.UpdateCapacity_WhenCalledWithInvalidCapacity_ShouldThrowArgumentException(invalidCapacity: -1) [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.UpdateDetails_WhenCalledWithValidData_ShouldUpdateSuccessfully [8 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.CalendarAttendance_WhenCreatedWithInvalidMaxCapacity_ShouldThrowArgumentException(invalidCapacity: 0) [9 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.CalendarAttendance_WhenCreatedWithInvalidMaxCapacity_ShouldThrowArgumentException(invalidCapacity: -1) [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.IsToday_WhenAttendanceDateIsNotToday_ShouldReturnFalse [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.UpdateEventDate_WhenCalledWithNullDate_ShouldThrowArgumentNullException [7 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.Deactivate_WhenCalled_ShouldSetIsActiveToFalse [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.IsUpcoming_WhenEventDateIsInFuture_ShouldReturnTrue [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.UpdateEventDate_WhenCalledWithValidDate_ShouldUpdateSuccessfully [8 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.Event_WhenCreatedWithNullEventDate_ShouldThrowArgumentNullException [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.Event_WhenCreatedWithValidData_ShouldCreateSuccessfully [7 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.Event_WhenCreatedWithTitleTooLong_ShouldThrowArgumentException [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.IsThisMonth_WhenEventDateIsThisMonth_ShouldReturnTrue [7 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.CalendarAttendance_WhenCreatedWithValidData_ShouldCreateSuccessfully [36 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.UpdateDetails_WhenCalledWithValidData_ShouldUpdateSuccessfully [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.CalendarAttendance_WhenCreatedWithNullAttendanceDate_ShouldThrowArgumentNullException [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.IsThisWeek_WhenAttendanceDateIsThisWeek_ShouldReturnTrue [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.CalendarAttendance_WhenCreatedWithoutTimeRange_ShouldThrowArgumentException [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.EventTests.IsUpcoming_WhenEventDateIsInPast_ShouldReturnFalse [10 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.GetTypeDisplayName_ShouldReturnCorrectDisplayName [5 ms]
[xUnit.net 00:00:00.58]       Expected hasConflict to be True, but found False.
[xUnit.net 00:00:00.58]       Stack Trace:
[xUnit.net 00:00:00.58]            at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
[xUnit.net 00:00:00.58]            at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
[xUnit.net 00:00:00.58]            at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
[xUnit.net 00:00:00.58]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.58]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.58]            at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
[xUnit.net 00:00:00.58]            at FluentAssertions.Primitives.BooleanAssertions`1.BeTrue(String because, Object[] becauseArgs)
[xUnit.net 00:00:00.58]         /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/Services/EventDomainServiceTests.cs(47,0): at Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenEventsOverlap_ShouldReturnTrue()
[xUnit.net 00:00:00.58]            at System.RuntimeMethodHandle.InvokeMethod(Object target, Void** arguments, Signature sig, Boolean isConstructor)
[xUnit.net 00:00:00.58]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.59]       Expected hasConflict to be True, but found False.
[xUnit.net 00:00:00.59]       Stack Trace:
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
[xUnit.net 00:00:00.59]            at FluentAssertions.Primitives.BooleanAssertions`1.BeTrue(String because, Object[] becauseArgs)
[xUnit.net 00:00:00.59]         /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/Services/EventDomainServiceTests.cs(303,0): at Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WithOverlappingTimes_ShouldReturnTrue()
[xUnit.net 00:00:00.59]            at System.RuntimeMethodHandle.InvokeMethod(Object target, Void** arguments, Signature sig, Boolean isConstructor)
[xUnit.net 00:00:00.59]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.59]       Expected exception message to match the equivalent of "*End time must be between 00:00 and 23:59*", but "Start time must be before end time" does not.
[xUnit.net 00:00:00.59]       Stack Trace:
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.59]            at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
[xUnit.net 00:00:00.59]            at FluentAssertions.Specialized.ExceptionAssertions`1.AssertExceptionMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
[xUnit.net 00:00:00.59]            at FluentAssertions.Specialized.ExceptionAssertions`1.WithMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
[xUnit.net 00:00:00.59]         /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/ValueObjects/EventDateTests.cs(103,0): at Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenEndTimeIsInvalid_ShouldThrowArgumentException(Int32 hours)
[xUnit.net 00:00:00.59]            at InvokeStub_EventDateTests.EventDate_WhenEndTimeIsInvalid_ShouldThrowArgumentException(Object, Span`1)
[xUnit.net 00:00:00.59]            at System.Reflection.MethodBaseInvoker.InvokeWithOneArg(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.RescheduleAttendance_WhenCalledWithNullDate_ShouldThrowArgumentNullException [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.RescheduleAttendance_WhenCalledWithValidDate_ShouldUpdateSuccessfully [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.IsToday_WhenAttendanceDateIsToday_ShouldReturnTrue [< 1 ms]
  Passed Batuara.Domain.Tests.Entities.CalendarAttendanceTests.UpdateCapacity_WhenCalledWithValidData_ShouldUpdateSuccessfully [< 1 ms]
  Failed Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenEventsOverlap_ShouldReturnTrue [135 ms]
  Error Message:
   Expected hasConflict to be True, but found False.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
   at FluentAssertions.Primitives.BooleanAssertions`1.BeTrue(String because, Object[] becauseArgs)
   at Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenEventsOverlap_ShouldReturnTrue() in /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/Services/EventDomainServiceTests.cs:line 47
   at System.RuntimeMethodHandle.InvokeMethod(Object target, Void** arguments, Signature sig, Boolean isConstructor)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.ValidateEventBusinessRules_WhenSundayEventBeforeAfternoon_ShouldReturnInvalid [< 1 ms]
  Failed Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WithOverlappingTimes_ShouldReturnTrue [1 ms]
  Error Message:
   Expected hasConflict to be True, but found False.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
   at FluentAssertions.Primitives.BooleanAssertions`1.BeTrue(String because, Object[] becauseArgs)
   at Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WithOverlappingTimes_ShouldReturnTrue() in /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/Services/EventDomainServiceTests.cs:line 303
   at System.RuntimeMethodHandle.InvokeMethod(Object target, Void** arguments, Signature sig, Boolean isConstructor)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Failed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenEndTimeIsInvalid_ShouldThrowArgumentException(hours: -1) [88 ms]
  Error Message:
   Expected exception message to match the equivalent of "*End time must be between 00:00 and 23:59*", but "Start time must be before end time" does not.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
   at FluentAssertions.Specialized.ExceptionAssertions`1.AssertExceptionMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
   at FluentAssertions.Specialized.ExceptionAssertions`1.WithMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
   at Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenEndTimeIsInvalid_ShouldThrowArgumentException(Int32 hours) in /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/ValueObjects/EventDateTests.cs:line 103
   at InvokeStub_EventDateTests.EventDate_WhenEndTimeIsInvalid_ShouldThrowArgumentException(Object, Span`1)
   at System.Reflection.MethodBaseInvoker.InvokeWithOneArg(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenCreatedWithValidDate_ShouldCreateSuccessfully [3 ms]
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.GetFormattedTime_WhenHasTimeRange_ShouldReturnFormattedRange [< 1 ms]
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.Equals_WhenComparingDifferentEventDates_ShouldReturnFalse [< 1 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.GetEstimatedDuration_ShouldReturnCorrectDuration(eventType: Evento, expectedHours: 2) [6 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.GetEstimatedDuration_ShouldReturnCorrectDuration(eventType: Palestra, expectedHours: 2) [< 1 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.GetEstimatedDuration_ShouldReturnCorrectDuration(eventType: Bazar, expectedHours: 6) [< 1 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.GetEstimatedDuration_ShouldReturnCorrectDuration(eventType: Celebracao, expectedHours: 3) [< 1 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.GetEstimatedDuration_ShouldReturnCorrectDuration(eventType: Festa, expectedHours: 4) [< 1 ms]
[xUnit.net 00:00:00.60]       Expected hasConflict to be True, but found False.
[xUnit.net 00:00:00.60]       Stack Trace:
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
[xUnit.net 00:00:00.60]            at FluentAssertions.Primitives.BooleanAssertions`1.BeTrue(String because, Object[] becauseArgs)
[xUnit.net 00:00:00.60]         /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/Services/EventDomainServiceTests.cs(62,0): at Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenOneEventIsAllDay_ShouldReturnTrue()
[xUnit.net 00:00:00.60]            at System.RuntimeMethodHandle.InvokeMethod(Object target, Void** arguments, Signature sig, Boolean isConstructor)
[xUnit.net 00:00:00.60]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.60]     Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(hours: 24) [FAIL]
[xUnit.net 00:00:00.61]     Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(hours: 25) [FAIL]
[xUnit.net 00:00:00.62]     Batuara.Domain.Tests.Services.EventDomainServiceTests.CanScheduleEventAsync_WhenHasConflicts_ShouldReturnFalse [FAIL]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenEventsOnDifferentDates_ShouldReturnFalse [< 1 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.CanScheduleEventAsync_WhenNoConflicts_ShouldReturnTrue [1 ms]
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.Equals_WhenComparingEqualEventDates_ShouldReturnTrue [4 ms]
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsEqualToEndTime_ShouldThrowArgumentException [< 1 ms]
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenCreatedWithDateOnly_ShouldCreateAllDayEvent [< 1 ms]
  Failed Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenOneEventIsAllDay_ShouldReturnTrue [6 ms]
  Error Message:
   Expected hasConflict to be True, but found False.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
   at FluentAssertions.Primitives.BooleanAssertions`1.BeTrue(String because, Object[] becauseArgs)
   at Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenOneEventIsAllDay_ShouldReturnTrue() in /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/Services/EventDomainServiceTests.cs:line 62
   at System.RuntimeMethodHandle.InvokeMethod(Object target, Void** arguments, Signature sig, Boolean isConstructor)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.IsSpecialEvent_WhenEventIsFesta_ShouldReturnTrue [< 1 ms]
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenCreatedWithDefaultDate_ShouldThrowArgumentException [6 ms]
[xUnit.net 00:00:00.60]       Expected exception message to match the equivalent of "*Start time must be between 00:00 and 23:59*", but "Start time must be before end time" does not.
[xUnit.net 00:00:00.60]       Stack Trace:
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.60]            at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
[xUnit.net 00:00:00.60]            at FluentAssertions.Specialized.ExceptionAssertions`1.AssertExceptionMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
[xUnit.net 00:00:00.60]            at FluentAssertions.Specialized.ExceptionAssertions`1.WithMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
[xUnit.net 00:00:00.60]         /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/ValueObjects/EventDateTests.cs(86,0): at Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(Int32 hours)
[xUnit.net 00:00:00.60]            at InvokeStub_EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(Object, Span`1)
[xUnit.net 00:00:00.60]            at System.Reflection.MethodBaseInvoker.InvokeWithOneArg(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
[xUnit.net 00:00:00.61]       Expected exception message to match the equivalent of "*Start time must be between 00:00 and 23:59*", but "Start time must be before end time" does not.
[xUnit.net 00:00:00.61]       Stack Trace:
[xUnit.net 00:00:00.61]            at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
[xUnit.net 00:00:00.61]            at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
[xUnit.net 00:00:00.61]            at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
[xUnit.net 00:00:00.61]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.61]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.61]            at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
[xUnit.net 00:00:00.61]            at FluentAssertions.Specialized.ExceptionAssertions`1.AssertExceptionMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
[xUnit.net 00:00:00.61]            at FluentAssertions.Specialized.ExceptionAssertions`1.WithMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
[xUnit.net 00:00:00.61]         /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/ValueObjects/EventDateTests.cs(86,0): at Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(Int32 hours)
[xUnit.net 00:00:00.61]            at InvokeStub_EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(Object, Span`1)
[xUnit.net 00:00:00.61]            at System.Reflection.MethodBaseInvoker.InvokeWithOneArg(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.GetFormattedTime_WhenHasOnlyStartTime_ShouldReturnStartTimeMessage [2 ms]
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(hours: -1) [< 1 ms]
  Failed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(hours: 24) [1 ms]
  Error Message:
   Expected exception message to match the equivalent of "*Start time must be between 00:00 and 23:59*", but "Start time must be before end time" does not.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
   at FluentAssertions.Specialized.ExceptionAssertions`1.AssertExceptionMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
   at FluentAssertions.Specialized.ExceptionAssertions`1.WithMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
   at Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(Int32 hours) in /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/ValueObjects/EventDateTests.cs:line 86
   at InvokeStub_EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(Object, Span`1)
   at System.Reflection.MethodBaseInvoker.InvokeWithOneArg(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.ValidateEventBusinessRules_WhenValidEvent_ShouldReturnValid [8 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.ValidateEventBusinessRules_WhenPalestraWithoutTime_ShouldReturnInvalid [< 1 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.IsSpecialEvent_WhenEventIsRegular_ShouldReturnFalse [< 1 ms]
  Failed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(hours: 25) [7 ms]
  Error Message:
   Expected exception message to match the equivalent of "*Start time must be between 00:00 and 23:59*", but "Start time must be before end time" does not.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
   at FluentAssertions.Specialized.ExceptionAssertions`1.AssertExceptionMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
   at FluentAssertions.Specialized.ExceptionAssertions`1.WithMessage(String expectedWildcardPattern, String because, Object[] becauseArgs)
   at Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(Int32 hours) in /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/ValueObjects/EventDateTests.cs:line 86
   at InvokeStub_EventDateTests.EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(Object, Span`1)
   at System.Reflection.MethodBaseInvoker.InvokeWithOneArg(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.EventDate_WhenStartTimeIsAfterEndTime_ShouldThrowArgumentException [< 1 ms]
[xUnit.net 00:00:00.62]       Expected canSchedule to be False, but found True.
[xUnit.net 00:00:00.62]       Stack Trace:
[xUnit.net 00:00:00.62]            at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
[xUnit.net 00:00:00.62]            at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
[xUnit.net 00:00:00.62]            at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
[xUnit.net 00:00:00.62]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.62]            at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
[xUnit.net 00:00:00.62]            at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
[xUnit.net 00:00:00.62]            at FluentAssertions.Primitives.BooleanAssertions`1.BeFalse(String because, Object[] becauseArgs)
[xUnit.net 00:00:00.62]         /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/Services/EventDomainServiceTests.cs(134,0): at Batuara.Domain.Tests.Services.EventDomainServiceTests.CanScheduleEventAsync_WhenHasConflicts_ShouldReturnFalse()
[xUnit.net 00:00:00.62]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.64]   Finished:    Batuara.Domain.Tests
[xUnit.net 00:00:00.00] xUnit.net VSTest Adapter v2.5.3.1+6b60a9e56a (64-bit .NET 8.0.19)
[xUnit.net 00:00:00.26]   Discovering: Batuara.Application.Tests
[xUnit.net 00:00:00.30]   Discovered:  Batuara.Application.Tests
[xUnit.net 00:00:00.32]   Starting:    Batuara.Application.Tests
[xUnit.net 00:00:00.22]   Discovering: Batuara.Infrastructure.Tests
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.GetFormattedTime_WhenIsAllDay_ShouldReturnAllDayMessage [< 1 ms]
  Passed Batuara.Domain.Tests.ValueObjects.EventDateTests.Equals_WhenComparingWithNull_ShouldReturnFalse [< 1 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.GetNextAvailableDate_ShouldReturnAppropriateDate [11 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.SuggestAlternativeDates_ShouldReturnValidAlternatives [14 ms]
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.ValidateEventBusinessRules_WhenEventInPast_ShouldReturnInvalid [< 1 ms]
  Failed Batuara.Domain.Tests.Services.EventDomainServiceTests.CanScheduleEventAsync_WhenHasConflicts_ShouldReturnFalse [12 ms]
  Error Message:
   Expected canSchedule to be False, but found True.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.AddPreFormattedFailure(String formattedFailureMessage)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(Func`1 getFailureReason)
   at FluentAssertions.Execution.AssertionChain.FailWith(String message, Object[] args)
   at FluentAssertions.Primitives.BooleanAssertions`1.BeFalse(String because, Object[] becauseArgs)
   at Batuara.Domain.Tests.Services.EventDomainServiceTests.CanScheduleEventAsync_WhenHasConflicts_ShouldReturnFalse() in /home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/Services/EventDomainServiceTests.cs:line 134
--- End of stack trace from previous location ---
  Passed Batuara.Domain.Tests.Services.EventDomainServiceTests.HasTimeConflict_WhenEventsDoNotOverlap_ShouldReturnFalse [4 ms]

Test Run Failed.
Total tests: 77
     Passed: 70
     Failed: 7
 Total time: 1.5841 Seconds
     1>Project "/home/runner/work/Batuara.net/Batuara.net/Batuara.sln" (1) is building "/home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/Batuara.Domain.Tests.csproj" (3) on node 1 (VSTest target(s)).
     3>_VSTestConsole:
         MSB4181: The "VSTestTask" task returned false but did not log an error.
     3>Done Building Project "/home/runner/work/Batuara.net/Batuara.net/tests/Batuara.Domain.Tests/Batuara.Domain.Tests.csproj" (VSTest target(s)) -- FAILED.
[xUnit.net 00:00:00.16]   Discovering: Batuara.API.Tests
[xUnit.net 00:00:00.30]   Discovered:  Batuara.Infrastructure.Tests
[xUnit.net 00:00:00.30]   Starting:    Batuara.Infrastructure.Tests
[xUnit.net 00:00:00.46]   Finished:    Batuara.Application.Tests
[xUnit.net 00:00:00.25]   Discovered:  Batuara.API.Tests
[xUnit.net 00:00:00.26]   Starting:    Batuara.API.Tests
[xUnit.net 00:00:00.41]   Finished:    Batuara.Infrastructure.Tests
[xUnit.net 00:00:00.36]   Finished:    Batuara.API.Tests
  Passed Batuara.Application.Tests.UnitTest1.Test1 [6 ms]

  Passed Batuara.Infrastructure.Tests.UnitTest1.Test1 [2 ms]

Test Run Successful.
Total tests: 1
     Passed: 1
 Total time: 1.3168 Seconds
Test Run Successful.
Total tests: 1
     Passed: 1
 Total time: 1.3999 Seconds
  Passed Batuara.API.Tests.UnitTest1.Test1 [2 ms]

Test Run Successful.
Total tests: 1
     Passed: 1
 Total time: 1.3866 Seconds
     1>Done Building Project "/home/runner/work/Batuara.net/Batuara.net/Batuara.sln" (VSTest target(s)) -- FAILED.

Build FAILED.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:03.22
Error: Process completed with exit code 1.