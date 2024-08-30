// 检查无障碍服务是否已经启用，如果没有启用则跳转到无障碍服务启用界面，并等待无障碍服务启动；当无障碍服务启动后脚本会继续运行。
auto.waitFor();

// 预设的联系人列表，包含姓名和电话号码
var checkName = [
    {name: '张三', phone: '13111112222'}, 
    {name: '李四', phone: '13144445555'}
];

// 检查应用是否有写入联系人的权限
if (context.checkSelfPermission(android.Manifest.permission.WRITE_CONTACTS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
    // 如果没有权限，使用 Intent 打开应用的设置页面，让用户手动授予权限
    var intent = new android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
    intent.setData(android.net.Uri.parse("package:" + context.getPackageName()));
    intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
    context.startActivity(intent);
    
    // 提示用户在设置中授予联系人权限，并退出脚本
    toast("请在设置中授予联系人权限");
    exit();
} else {
    // 如果已授予权限，循环将预设的联系人写入通讯录
    for (var i = 0; i < checkName.length; i++) {
        writeContct(checkName[i].phone, checkName[i].name);
    }

    // 清空所有联系人（取消注释可以启用此功能）
    // cleanContact();
}

// 写入单个联系人到通讯录
function writeContct(phone, name) {
    // 创建 ContentValues 对象，用于存储联系人数据
    var a = new android.content.ContentValues();
    a.put("account_type", android.accounts.AccountManager.KEY_ACCOUNT_TYPE); // 设置账户类型
    a.put("account_name", android.accounts.AccountManager.KEY_ACCOUNT_NAME); // 设置账户名称

    // 插入一个空白的 RawContact，获取其 URI
    var rawContactUri = context.getContentResolver().insert(android.provider.ContactsContract.RawContacts.CONTENT_URI, a);
    
    // 从 URI 中解析出 RawContact 的 ID
    var rawContactId = android.content.ContentUris.parseId(rawContactUri);

    // 创建用于存储姓名数据的 ContentValues 对象
    var b = new android.content.ContentValues();
    b['put(java.lang.String,java.lang.Long)']("raw_contact_id", rawContactId); // 设置 RawContact ID
    b.put("mimetype", "vnd.android.cursor.item/name"); // 设置数据类型为姓名
    b.put("data1", name); // 设置联系人姓名
    context.getContentResolver().insert(android.provider.ContactsContract.Data.CONTENT_URI, b); // 插入姓名数据

    // 创建用于存储电话号码数据的 ContentValues 对象
    var c = new android.content.ContentValues();
    c['put(java.lang.String,java.lang.Long)']("raw_contact_id", rawContactId); // 设置 RawContact ID
    c.put("mimetype", "vnd.android.cursor.item/phone_v2"); // 设置数据类型为电话号码
    c.put("data1", phone); // 设置电话号码
    c["put(java.lang.String,java.lang.Integer)"]("data2", 2); // 设置电话号码类型（2 代表手机）
    context.getContentResolver().insert(android.provider.ContactsContract.Data.CONTENT_URI, c); // 插入电话号码数据
}

// 清空通讯录中所有联系人
function cleanContact() {
    // 创建 ContentProviderOperation 对象，用于批量操作
    var ContentProviderOperation = android.content.ContentProviderOperation;
    var resolver = context.getContentResolver(); // 获取 ContentResolver 对象，用于操作数据库

    // 构建 RawContacts 表的 URI，并附加参数使其操作同步适配器
    var rawUri = android.provider.ContactsContract.RawContacts.CONTENT_URI.buildUpon()
                    .appendQueryParameter("caller_is_syncadapter", "true")
                    .build();

    // 创建一个 ArrayList 来存储批量操作的命令
    var ops = new java.util.ArrayList();
    
    // 添加删除操作，删除所有的 RawContacts 数据
    ops.add(ContentProviderOperation.newDelete(rawUri)
                .withSelection("_id > ?", ["-1"]) // 设置选择条件，删除所有 ID 大于 -1 的数据
                .build());

    try {
        // 批量执行所有操作
        resolver.applyBatch("com.android.contacts", ops);
        toast("已清空所有联系人"); // 提示用户操作完成
    } catch (e) {
        // 捕获并打印异常信息
        console.error("清空联系人失败: " + e);
    }
}
