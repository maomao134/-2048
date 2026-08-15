@echo off
rem 使用便携版 Node 18 构建 .amr 包（框架在 Node 22+ 上有兼容问题）
set "NODE18=D:\a\tools\node18\node-v18.20.8-win-x64"
set "PATH=%NODE18%;%PATH%"
"%NODE18%\node.exe" "%NODE18%\node_modules\aiot-vue-cli\src\cli.js" -c -q -p
pause
