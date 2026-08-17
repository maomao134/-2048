@echo off
echo ɾ�����ļ���
adb shell rm /userdisk/1.amr
echo �����ļ���
adb push 8002048151526020.2_0_1.amr /userdisk/1.amr
echo ��װӦ����
adb shell miniapp_cli install /userdisk/1.amr
echo ����Ӧ����
adb shell miniapp_cli start 8002048151526020
timeout 3