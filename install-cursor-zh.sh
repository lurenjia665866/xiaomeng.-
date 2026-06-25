#!/bin/bash
# ==============================================
# Cursor 汉化 + 安装中文语言包
# ==============================================

echo "================================"
echo "  Cursor 汉化安装脚本"
echo "================================"

# 1. 设置 locale 为 zh-CN
echo "[1/3] 设置 locale = zh-CN..."
ARGV="$HOME/.cursor/argv.json"

# 如果已有 locale 配置则替换，否则添加
if grep -q '"locale"' "$ARGV" 2>/dev/null; then
  sed -i '' 's/"locale": "[^"]*"/"locale": "zh-CN"/' "$ARGV"
else
  # 在 crash-reporter 行后面添加 locale
  sed -i '' 's/"enable-crash-reporter": true,/"enable-crash-reporter": true,\n\t"locale": "zh-CN",/' "$ARGV"
fi
echo "  ✅ argv.json 已配置 locale=zh-CN"

# 2. 安装中文语言包扩展
echo "[2/3] 安装中文语言包扩展..."
SRC="/Users/liyong/Documents/车贷业务/.cursor-extensions/MS-CEINTL.vscode-language-pack-zh-hans-1.126.2026062502"
TGT="$HOME/.cursor/extensions/MS-CEINTL.vscode-language-pack-zh-hans-1.126.2026062502"

mkdir -p "$TGT"
cp -R "$SRC/"* "$TGT/"

# 3. 更新 extensions.json
echo "[3/3] 更新扩展注册信息..."
EXT_JSON="$HOME/.cursor/extensions/extensions.json"

if command -v python3 &>/dev/null; then
python3 << PYEOF
import json, os

ext_json_path = os.path.expanduser("$HOME/.cursor/extensions/extensions.json")
with open(ext_json_path) as f:
    exts = json.load(f)

# 检查是否已安装
for ext in exts:
    if "MS-CEINTL.vscode-language-pack-zh-hans" in ext.get("identifier", {}).get("id", ""):
        print("  ⚡ 中文语言包已注册，跳过")
        break
else:
    new_ext = {
        "identifier": {"id": "MS-CEINTL.vscode-language-pack-zh-hans"},
        "version": "1.126.2026062502",
        "location": {
            "\$mid": 1,
            "fsPath": "$HOME/.cursor/extensions/MS-CEINTL.vscode-language-pack-zh-hans-1.126.2026062502",
            "path": "$HOME/.cursor/extensions/MS-CEINTL.vscode-language-pack-zh-hans-1.126.2026062502",
            "scheme": "file"
        },
        "relativeLocation": "MS-CEINTL.vscode-language-pack-zh-hans-1.126.2026062502",
        "metadata": {
            "isApplicationScoped": True,
            "installedTimestamp": int(__import__('time').time() * 1000),
            "source": "gallery",
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "publisherId": "b0cfad7e-4b11-44ed-a2e2-d1a0b8a3c0f8",
            "publisherDisplayName": "MS-CEINTL",
            "targetPlatform": "undefined"
        }
    }
    exts.append(new_ext)
    with open(ext_json_path, 'w') as f:
        json.dump(exts, f, indent=4)
    print("  ✅ 中文语言包已注册")
PYEOF
else
  echo "  ⚠️ Python3 不可用，请手动添加扩展注册信息"
fi

echo ""
echo "================================"
echo "  ✅ Cursor 汉化完成！"
echo "  请重启 Cursor 生效"
echo "================================"
echo ""
echo "  注意：如果界面部分未完全中文，"
echo "  请确保域名已解析后，在 Cursor 内"
echo "  Ctrl+Shift+P → Configure Display Language → zh-CN"
