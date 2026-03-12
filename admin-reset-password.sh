#!/bin/bash
# Mi English - 管理员重置密码脚本
# 用法: ./admin-reset-password.sh <用户邮箱> <新密码>

SUPABASE_URL="https://hfihddrzhyuoxripwsjy.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmaWhkZHJ6aHl1b3hyaXB3c2p5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYyNzI4MywiZXhwIjoyMDg4MjAzMjgzfQ.WF0gpxXoSleuv03oQ0Z-cRI7J6Gt8G9AUVzn0lxEbcs"

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "用法: ./admin-reset-password.sh <用户邮箱> <新密码>"
  echo "示例: ./admin-reset-password.sh zhangsan@qq.com newpass123"
  exit 1
fi

EMAIL="$1"
NEW_PASSWORD="$2"

echo "🔍 查找用户: $EMAIL ..."

# 1. 通过邮箱查找用户 ID
USER_ID=$(curl -s -X GET \
  "$SUPABASE_URL/auth/v1/admin/users" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "apikey: $SERVICE_ROLE_KEY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
users = data.get('users', [])
target = '$EMAIL'.lower()
for u in users:
    if u.get('email','').lower() == target:
        print(u['id'])
        sys.exit(0)
sys.exit(1)
" 2>/dev/null)

if [ -z "$USER_ID" ]; then
  echo "❌ 未找到邮箱为 $EMAIL 的用户"
  exit 1
fi

echo "✅ 找到用户: $USER_ID"
echo "🔑 正在重置密码..."

# 2. 用 Admin API 直接更新密码
RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X PUT \
  "$SUPABASE_URL/auth/v1/admin/users/$USER_ID" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"$NEW_PASSWORD\"}")

if [ "$RESULT" = "200" ]; then
  echo "✅ 密码已重置成功！"
  echo "   邮箱: $EMAIL"
  echo "   新密码: $NEW_PASSWORD"
  echo "   请通知学员用新密码登录"
else
  echo "❌ 重置失败，HTTP 状态码: $RESULT"
fi
