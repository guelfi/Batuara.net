#!/bin/bash

# Debug script for change password endpoint

echo "=== Debug Change Password Endpoint ==="

# Step 1: Login to get token
echo "Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X "POST" "http://localhost:3003/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@casabatuara.org.br","password":"admin123"}')
echo "Login response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d '"' -f 4)
echo "Token: $TOKEN"

# Step 2: Test change password endpoint with a strong password
echo "Step 2: Testing change password endpoint with strong password..."
CHANGE_PASSWORD_RESPONSE=$(curl -v -X "PUT" "http://localhost:3003/api/auth/change-password" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"currentPassword":"admin123","newPassword":"NovaSenha123!","confirmNewPassword":"NovaSenha123!"}' 2>&1)
echo "Change password response:"
echo "$CHANGE_PASSWORD_RESPONSE"

echo "=== Debug Complete ==="