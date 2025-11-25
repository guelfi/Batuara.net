#!/bin/bash

# Full test script for password change functionality

echo "=== Full Password Change Test ==="

# Step 1: Try to login with original password
echo "Step 1: Trying to log in with original password..."
LOGIN_RESPONSE=$(curl -s -X "POST" "http://localhost:3003/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@casabatuara.org.br","password":"admin123"}')

# Check if login was successful
if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo "Login with original password successful"
    # Extract token
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d '"' -f 4)
    echo "Token: $TOKEN"
    
    # Step 2: Change password to new password
    echo "Step 2: Changing password to new password..."
    CHANGE_PASSWORD_RESPONSE=$(curl -s -X "PUT" "http://localhost:3003/api/auth/change-password" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"currentPassword":"admin123","newPassword":"NovaSenha123!","confirmNewPassword":"NovaSenha123!"}')
    echo "Change password response:"
    echo "$CHANGE_PASSWORD_RESPONSE"
else
    echo "Login with original password failed - password might already be changed"
    # Try to login with new password
    echo "Trying to log in with new password..."
    LOGIN_NEW_RESPONSE=$(curl -s -X "POST" "http://localhost:3003/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@casabatuara.org.br","password":"NovaSenha123!"}')
    
    if echo "$LOGIN_NEW_RESPONSE" | grep -q '"success":true'; then
        echo "Login with new password successful"
        # Extract new token
        TOKEN=$(echo "$LOGIN_NEW_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d '"' -f 4)
        echo "Token: $TOKEN"
        
        # Step 3: Change password back to original (with proper format)
        echo "Step 3: Changing password back to original..."
        CHANGE_PASSWORD_BACK_RESPONSE=$(curl -s -X "PUT" "http://localhost:3003/api/auth/change-password" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"currentPassword":"NovaSenha123!","newPassword":"Admin123!","confirmNewPassword":"Admin123!"}')
        echo "Change password back response:"
        echo "$CHANGE_PASSWORD_BACK_RESPONSE"
    else
        echo "Login with new password also failed"
        echo "Login response: $LOGIN_NEW_RESPONSE"
        exit 1
    fi
fi

# Step 4: Login with original password again
echo "Step 4: Logging in with original password again..."
LOGIN_ORIGINAL_RESPONSE=$(curl -s -X "POST" "http://localhost:3003/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@casabatuara.org.br","password":"Admin123!"}')
echo "Login with original password response: $LOGIN_ORIGINAL_RESPONSE"

echo "=== Test Complete ==="