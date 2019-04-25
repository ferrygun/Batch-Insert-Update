/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
 */
$.import("public.aa.bb.lib.xsjs.session.xsjslib", "session");
var SESSIONINFO = $.public.aa.bb.lib.xsjs.session;

function merge_array(array1, array2) {
    var result_array = [];
    var arr = array1.concat(array2);
    var len = arr.length;
    var assoc = {};

    while(len--) {
        var item = arr[len];

        if(!assoc[item]) 
        { 
            result_array.unshift(item);
            assoc[item] = true;
        }
    }

    return result_array;
}

function differenceOf2Arrays (array1, array2) {
    var temp = [];
    array1 = array1.toString().split(',').map(Number);
    array2 = array2.toString().split(',').map(Number);
    
    for (var i in array1) {
    if(array2.indexOf(array1[i]) === -1) temp.push(array1[i]);
    }
    for(i in array2) {
    if(array1.indexOf(array2[i]) === -1) temp.push(array2[i]);
    }
    return temp.sort((a,b) => a-b);
}

function create_before_exit(param) {

    var after = param.afterTableName;
    var pStmt = null;

    pStmt = param.connection.prepareStatement("select * from \"" + after + "\"");	 
    var data = SESSIONINFO.recordSetToJSON(pStmt.executeQuery(), "Details");
    pStmt.close();  

    var ArrD = [];
    var ArrB = [];
    pStmt = param.connection.prepareStatement("select ID from \"goodmorning\".\"public.aa.bb.hdb::data.ContactPersons\"");
    var rs = pStmt.executeQuery();
    while (rs.next()) {
        ArrD.push(rs.getInteger(1));
    }
    
    pStmt = param.connection.prepareStatement("select ID from \"" + after + "\"");	
    rs = pStmt.executeQuery();
    while (rs.next()) {   
        ArrB.push(rs.getInteger(1));
    }

    pStmt = param.connection.prepareStatement("select ID, FIRSTNAME from \"goodmorning\".\"public.aa.bb.hdb::data.ContactPersons\" where \"ID\" = ?");
    pStmt.setString(1, data.Details[0].ID.toString());
    rs = pStmt.executeQuery();
    if (rs.next()) {
        //Existing record
		pStmt = param.connection.prepareStatement("delete from \"goodmorning\".\"public.aa.bb.hdb::data.ContactPersons\" where \"ID\" = ?");
        pStmt.setInteger(1, rs.getInteger(1));
        pStmt.execute();
        pStmt.close();

        var delArr = differenceOf2Arrays(ArrD, ArrB);
        for( var i = 0; i < delArr.length; i++) {
            pStmt = param.connection.prepareStatement("delete from \"goodmorning\".\"public.aa.bb.hdb::data.ContactPersons\" where \"ID\" = ?");
            pStmt.setInteger(1, parseInt(delArr[i]));
            pStmt.execute();
            pStmt.close();
        }
    } else {
        //New record
        pStmt = param.connection.prepareStatement("select \"goodmorning\".\"public.aa.bb.sequence::persons\".NEXTVAL from dummy");
        rs = pStmt.executeQuery();
        var NextValID = "";
        while (rs.next()) {
        	NextValID = rs.getString(1);
        }
        pStmt.close(); 
        
        ArrB = merge_array(ArrB, ArrD);
        var delArr = differenceOf2Arrays(ArrD, ArrB);
        for( var i = 0; i < delArr.length; i++) {
            pStmt = param.connection.prepareStatement("delete from \"goodmorning\".\"public.aa.bb.hdb::data.ContactPersons\" where \"ID\" = ?");
            pStmt.setInteger(1, parseInt(delArr[i]));
            pStmt.execute();
            pStmt.close();
        }
        
        pStmt = param.connection.prepareStatement("update\"" + after + "\"set \"ID\" = ?");
        pStmt.setString(1, NextValID);
        pStmt.execute();
        pStmt.close();
    }
}