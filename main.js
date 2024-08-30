auto.waitFor();

var checkName = [{name: '张三', phone: '13111112222'}, {name: '李四', phone: '13144445555'}];

if (context.checkSelfPermission(android.Manifest.permission.WRITE_CONTACTS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
    // 使用 Intent 打开应用的设置页面
    var intent = new android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
    intent.setData(android.net.Uri.parse("package:" + context.getPackageName()));
    intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
    context.startActivity(intent);
    toast("请在设置中授予联系人权限");
    exit();
} else {
    //把联系人循环写入通讯录
    for (var i = 0; i < checkName.length; i++) {
        writeContct(checkName[i].phone, checkName[i].name);
    }
    // 删除全部联系人
    // cleanContact();

}



// 写入通讯录单个联系人
function writeContct(phone, name) {
    var a = new android.content.ContentValues();
    a.put("account_type", android.accounts.AccountManager.KEY_ACCOUNT_TYPE);
    a.put("account_name", android.accounts.AccountManager.KEY_ACCOUNT_NAME);

    var rawContactUri = context.getContentResolver().insert(android.provider.ContactsContract.RawContacts.CONTENT_URI, a);
    var rawContactId = android.content.ContentUris.parseId(rawContactUri)

    var b = new android.content.ContentValues();
    b['put(java.lang.String,java.lang.Long)']("raw_contact_id", rawContactId);
    b.put("mimetype", "vnd.android.cursor.item/name");
    b.put("data1", name);
    context.getContentResolver().insert(android.provider.ContactsContract.Data.CONTENT_URI, b);

    var c = new android.content.ContentValues();
    c['put(java.lang.String,java.lang.Long)']("raw_contact_id", rawContactId);
    c.put("mimetype", "vnd.android.cursor.item/phone_v2");
    c.put("data1", phone);
    c["put(java.lang.String,java.lang.Integer)"]("data2", 2);
    context.getContentResolver().insert(android.provider.ContactsContract.Data.CONTENT_URI, c);
}



// 清空通讯录所有联系人
function cleanContact() {
    var ContentProviderOperation = android.content.ContentProviderOperation;
    var resolver = context.getContentResolver(); // 使用 context 获取 ContentResolver

    var rawUri = android.provider.ContactsContract.RawContacts.CONTENT_URI.buildUpon()
                    .appendQueryParameter("caller_is_syncadapter", "true")
                    .build();

    var ops = new java.util.ArrayList();
    
    // Delete all RawContacts
    ops.add(ContentProviderOperation.newDelete(rawUri)
                .withSelection("_id > ?", ["-1"]) // 选择条件删除所有 RawContacts
                .build());

    try {
        resolver.applyBatch("com.android.contacts", ops);
        toast("已清空所有联系人");
    } catch (e) {
        console.error("清空联系人失败: " + e);
    }
}
