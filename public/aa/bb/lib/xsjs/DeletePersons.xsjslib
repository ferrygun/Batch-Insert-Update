function delete_before_exit(param) {
    var pStmt = null;

    pStmt = param.connection.prepareStatement("delete from \"goodmorning\".\"public.aa.bb.hdb::data.ContactPersons\"");
    pStmt.execute();
    pStmt.close();
}