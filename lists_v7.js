a = ({
    //*************************************************************************
    //  Joan Anton Llarch - Kontrolcla Show Control - Barcelona - 2019
    //*************************************************************************
    // Device Local Script Variables
    Device:
    {   //  for the breakout function
        breakout_0: "", breakout_1: "", breakout_2: "", breakout_3: "",
        breakout_4: "", breakout_5: "", breakout_6: "", breakout_7: "",
        breakout_8: "", breakout_9: "",
        // for the calculation function
        calc_average: 0.1, calc_max : 0.1, calc_min : 0.1,
        calc_sum : 0.1, calc_count : 0,
        // for the search function
        search_str: "", search_index: -1,
    },
    //*************************************************************************
    // define local script error variables
    error_empty: "error: empty input",
    error_is_not_int: "error: not integer input",
    error_different_sizes: "error: lists of different sizes",
    ///////////////////////////////////////////////////////////////////////////
    //************************************************************************* 
    // CONVERT STRING TO MEDIALON LIST
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // this function converts any string with delimiters into a list object format string
    // if the delimiter is empty, works as auto looking for the most repited non character as a delimiter
    // input parametres: string input + name medialon list destiny + delimiter
    // required: the first two inputs
    // returns: the delimiter auto or manual for debug
    //*************************************************************************
    convert_to_medialon_list: function ( string_in, list_result, manual_delimiter )
    {   var max_key = manual_delimiter;
        // if manual_delimiter is empty, search for one
        if (manual_delimiter == "") {
            // find the non-word characters in a array using a RegularExprssion
            var pattern = /\W/g;
            var data = string_in.match(pattern);
            var max = 0;
            var aux = new Array();
            var s = data.sort().join('');
	        // . for any single character other than the newline character (\n)
            // and replace all occurrences of a specified value, using the global (g) modifier
            s.replace(/(.)\1+/g,
                function (a) {
                    if (max < a.length) {
                        max = a.length;
                        aux = a.split("");
                        max_key = aux[0];
                    }
                });
        }
        return this._convert_to_medialon_list_2(string_in, list_result, delimiter = max_key);
    },
    // private function
    _convert_to_medialon_list_2: function (string_in, list_result, delimiter) {
        var split_list = new Array();
        split_list = string_in.split( delimiter );
        // assemble as a manager list
        var result = split_list.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue(list_result + ".Text", result);
        return delimiter;
    },
    ///////////////////////////////////////////////////////////////////////////
    //************************************************************************* 
    // LIST ADJUST POSITION
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // this function let you change the position of an item within a list
    // if the new index has a sign +/- in front, the new position will be relative to the current index
    // input parametres: list name + current index + new index
    // required: the three inputs
    // returns: if exist error
    //*************************************************************************
    list_adjust_position: function (list_input, current_index, new_index) {
        var list_in_text = QMedialon.GetValueAsString(list_input + ".Text");
        var list_in_len = QMedialon.GetValueAsInteger(list_input + ".Count");
        // list to array
        var split_list = new Array();
        split_list = list_in_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1);
        // test current_index
        if ( current_index != "" ) {
            var current_index = parseInt(current_index, 10);
            if ( isNaN(current_index))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        //*********************************************************************
        // new index: get first character of the string
        var sign = new_index.charAt(0);
        // look for +/- sign
        if (sign == "+") {
            // slice from 1 to final
            new_index = current_index + parseInt(new_index.slice(1), 10);
        }
        else if (sign == "-") {
            new_index = current_index - parseInt(new_index.slice(1), 10);
        }
        else {
            // test new_index
            if ( new_index != "" ) {
                var new_index = parseInt(new_index, 10);
                if ( isNaN(new_index))
                    return this.error_is_not_int;
            }
            else
                return this.error_empty;
        }
        //*********************************************************************
        // check max & min
        if (new_index >= list_in_len) {
            new_index = list_in_len - 1;
        }
        else if (new_index < 0) {
            new_index = 0;
        }
        //*********************************************************************
        // get and delete the element of the array - returns an array of one element
        var element = split_list.splice(current_index, 1);
        // insert the element[0] in the new position
        split_list.splice(new_index, 0, element[0]);
        //*********************************************************************
        // assemble as a manager list
        var result = split_list.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue(list_input + ".Text", result);
        //
        return "";
    },
    ///////////////////////////////////////////////////////////////////////////
    //*************************************************************************
    // LIST BREAKIN - limited to 6 variables - to insert more vars, use again the function
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // this function allows specifying up to 6 variables that will be combined into a list
    // input list will be modified inserting at index the variables defined
    // if the new index is bigger than the size of the input list, empty items will be created
    // input parametres: list name + index + 6x input strings max
    // required: the two firsts inputs
    // returns: if exist error
    //*************************************************************************
    list_breakin: function ( list_input, index, string_in_0, string_in_1, string_in_2, string_in_3, string_in_4, string_in_5 ) {
        var list_in_text = QMedialon.GetValueAsString(list_input + ".Text");
        var list_in_len = QMedialon.GetValueAsInteger(list_input + ".Count");
        // test index
        if ( index != "" ) {
            var index = parseInt(index, 10);
            if ( isNaN(index))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        // list to array
        var split_list = new Array();
        split_list = list_in_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1)
        //*********************************************************************
        // if the list es shorter than the index, create empty values
        if (index >= list_in_len) {
            var k = index - list_in_len;
            while (k--) {
                split_list.push("");
                list_in_len++;
            }
        }
        //*********************************************************************
        var pending = string_in_0 + string_in_1 + string_in_2 + string_in_3 + string_in_4 + string_in_5;
        // check if the remain vars are all empty
        if (pending != "") {
            split_list.splice(index, 0, string_in_0);
            index++;
        }
        else
            return;
        //*********************************************************************
        var pending = string_in_1 + string_in_2 + string_in_3 + string_in_4 + string_in_5;
        // check if the remain vars are all empty
        if (pending != "") {
            split_list.splice(index, 0, string_in_1);
            index++;
        }
        //*********************************************************************
        var pending = string_in_2 + string_in_3 + string_in_4 + string_in_5;
        // check if the remain vars are all empty
        if (pending != "") {
            split_list.splice(index, 0, string_in_2);
            index++;
        }
        //*********************************************************************
        // check if the remain vars are all empty
        var pending = string_in_3 + string_in_4 + string_in_5;
        if (pending != "") {
            split_list.splice(index, 0, string_in_3);
            index++;
        }
        //*********************************************************************
        // check if the remain vars are all empty
        var pending = string_in_4 + string_in_5;
        if (pending != "") {
            split_list.splice(index, 0, string_in_4);
            index++;
        }
        //*********************************************************************
        // check if the remain var is empty
        var pending = string_in_5;
        if (pending != "") {
            split_list.splice(index, 0, string_in_5);
            index++;
        }
        //*********************************************************************
        // assemble as a manager list
        var result = split_list.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue(list_input + ".Text", result);
        //
        return "";
    },
    ///////////////////////////////////////////////////////////////////////////
    //*************************************************************************
    // LIST BREAKOUT - TWO DIFERENT FUNCTIONS, WITH KEEP OR REMOVE
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // these functions allow breaking out up to 10 items of a list into individual variables
    // number of strings output max = 10 - are definided in the manager device area of the script
    // input parametres: list name + index + number of strings output 
    // required: the three inputs
    // returns: if exist error
    //*************************************************************************
    // selected items will not be removed from the list
    list_breakout_keep: function (list_input, index, count) {
        this._list_get(list_input, index, count);
        return "";
    },
    // selected items will be removed from the list
    list_breakout_remove: function (list_input, index, count) {
        split_list2 = this._list_get(list_input, index, count);
        this._list_remove (list_input, index, count, split_list2 );
        return "";
    },
    //*************************************************************************
    // private function
    _list_get: function (list_input, index, count) {
        var list_in_text = QMedialon.GetValueAsString(list_input + ".Text");
        var list_in_len = QMedialon.GetValueAsInteger(list_input + ".Count");
        // test index
        if ( index != "" ) {
            var index = parseInt(index, 10);
            if ( isNaN(index))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        // test count
        if ( count != "" ) {
            var max = parseInt(count, 10);
            if ( isNaN(max))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        // list to array
        var split_list = new Array();
        split_list = list_in_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1)
        //*********************************************************************
        if (list_in_len - 1 >= index + 0) {
            if ( max >= 1 )
                this.Device.breakout_0 = split_list[index + 0];
        }
        if (list_in_len - 1 >= index + 1) {
            if (  max >= 2 )
                this.Device.breakout_1 = split_list[index + 1];
        }
        if (list_in_len - 1 >= index + 2) {
            if (  max >= 3 )
                this.Device.breakout_2 = split_list[index + 2];
        }
        if (list_in_len - 1 >= index + 3) {
            if (  max >= 4 )
                this.Device.breakout_3 = split_list[index + 3];
        }
        if (list_in_len - 1 >= index + 4) {
            if (  max >= 5 )
                this.Device.breakout_4 = split_list[index + 4];
        }
        if (list_in_len - 1 >= index + 5) {
            if (  max >= 6 )
                this.Device.breakout_5 = split_list[index + 5];
        }
        if (list_in_len - 1 >= index + 6) {
            if ( max >= 7 )
                this.Device.breakout_6 = split_list[index + 6];
        }
        if (list_in_len - 1 >= index + 7) {
            if ( max >= 8 )
                this.Device.breakout_7 = split_list[index + 7];
        }
        if (list_in_len - 1 >= index + 8) {
            if ( max >= 9 )
                this.Device.breakout_8 = split_list[index + 8];
        }
        if (list_in_len - 1 >= index + 9) {
            if ( max >= 10)
                this.Device.breakout_9 = split_list[index + 9];
        }
        return split_list;
    },
    //*************************************************************************
    // private function
    _list_remove: function (list_input, index, count, split_list2 ) {
        var list_in_len = QMedialon.GetValueAsInteger(list_input + ".Count");
        // test index
        if ( index != "" ) {
            var index = parseInt(index, 10);
            if ( isNaN(index))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        // test count
        if ( count != "" ) {
            var max = parseInt(count, 10);
            if ( isNaN(max))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        //*********************************************************************
        // delete count items or until end of list
        if ( list_in_len - index <= count )
            max = list_in_len - index;
        for (var i = 0; i < max; i++) {
            split_list2.splice(index, 1);
        }
        //*********************************************************************
        // assemble as a manager list
        var result = split_list2.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue(list_input + ".Text", result);
        return "";
    },
    ///////////////////////////////////////////////////////////////////////////
    //*************************************************************************
    // LIST CALCULATION - TWO DIFERENT FUNCTIONS, FROM TOP AND FROM BOTTOM
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // these functions will perform numerical calculations on a list
    // all items in the list MUST BE numerical (Integer or Real)
    // return vars are defined in the manager device area of the script
    // input parametres: list name and number of items
    // required: the two inputs
    // returns: if exist error
    //*************************************************************************
    // from top
    list_calculation_top: function (list_input, num_items ) {
        var list_in_text = QMedialon.GetValueAsString(list_input + ".Text");
        var len = QMedialon.GetValueAsInteger(list_input + ".Count");
        // test num_items
        if ( num_items != "" ) {
            var  num_items = parseInt(num_items, 10);
            if ( isNaN( num_items))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        //*********************************************************************
        // list to array
        var split_list = new Array();
        split_list = list_in_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1)
        // empty array
        var list_2 = new Array();
        //*********************************************************************
        // check  num_items
        if ( num_items > len || num_items == 0 )
             num_items = len;
        // get count
        this.Device.calc_count =  num_items;
        //*********************************************************************
        // get items from top direction, 0, and convert to floats
        for (var i = 0; i < num_items; i++)
            list_2[i] = parseFloat(split_list[i]);
        //*********************************************************************
        // sum and average
        this.Device.calc_sum = 0;
        for (var i = 0; i < num_items; i++)
            this.Device.calc_sum += list_2[i];
        this.Device.calc_average = this.Device.calc_sum / this.Device.calc_count;
        //*********************************************************************
        // max and min
        this.Device.calc_max = Math.max.apply(Math, list_2);
        this.Device.calc_min = Math.min.apply(Math, list_2);
        return "";
    },
    //*************************************************************************
    // from bottom
    list_calculation_bottom: function (list_input,  num_items) {
        var list_in_text = QMedialon.GetValueAsString(list_input + ".Text");
        var len = QMedialon.GetValueAsInteger(list_input + ".Count");
        // test  num_items
        if (  num_items != "" ) {
            var  num_items = parseInt( num_items, 10);
            if ( isNaN( num_items))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        //*********************************************************************
        // list to array
        var split_list = new Array();
        split_list = list_in_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1)
        //*********************************************************************
        // empty array
        var list_2 = new Array();
        //*********************************************************************
        // check  num_items
        if ( num_items > len || num_items == 0 )
             num_items = len;
        // get count
        this.Device.calc_count =  num_items;
        //*********************************************************************
        // get items from  num_items from bottom direction, and convert to floats
        for (var i = 0; i <  num_items; i++){
            list_2[i] = parseFloat(split_list[len-i-1]);
        };
        //*********************************************************************
        // sum and average
        this.Device.calc_sum = 0;
        for (var i = 0; i < num_items; i++)
            this.Device.calc_sum += list_2[i];
        this.Device.calc_average = this.Device.calc_sum / this.Device.calc_count;
        //*********************************************************************
        // max and min
        this.Device.calc_max = Math.max.apply(Math, list_2);
        this.Device.calc_min = Math.min.apply(Math, list_2);
        //
        return "";
    },
    ///////////////////////////////////////////////////////////////////////////
    //*************************************************************************
    // LIST FILTER - TWO DIFERENT FUNCTIONS, CASE SENSITIVE AND CASE INSENSITIVE
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // these functions filter a list input in real time and output the resulting list
    // input parametres: list name original + search term + list name result 
    // required: the three inputs
    // returns: nothing
    //*************************************************************************
    // case sensitive yes
    list_filter_case_sens_yes: function (list_input, search_term, list_result) {
        var pathern = new RegExp(search_term);
        this._list_filter (list_input, pathern, list_result);  
    },
    //*************************************************************************
    // case sensitive no
    list_filter_case_sens_no: function (list_input, search_term, list_result) {
        var pathern = new RegExp(search_term, "i");
        this._list_filter (list_input, pathern, list_result);
    },
    //*************************************************************************
    // private function
    _list_filter: function (list_input, pathern, list_result) {
        var list_name_in_text = QMedialon.GetValueAsString(list_input + ".Text");
        var list_len = QMedialon.GetValueAsInteger(list_input + ".Count");
        //*********************************************************************
        // list to array
        var split_list = new Array();
        split_list = list_name_in_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1)
        //*********************************************************************
        // new vars
        var list_2 = new Array();
        var result = 0;
        var index = 0;
        //*********************************************************************
        for (var i = 0; i < list_len; i++) {
            result = split_list[i].search(pathern);
            if (result != -1) {
                list_2[index] = split_list[i];
                index++;
            }
        }
        //*********************************************************************
        // assemble as a manager list
        var result = list_2.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue(list_result + ".Text", result);
        return "";
    },
    ///////////////////////////////////////////////////////////////////////////
    //*************************************************************************
    // LIST MERGE
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // this function is used to merge several lists into one
    // input parametres: format string - list name 1 to 5 - list name result 
    // required: the lists input and the list result
    // returns: nothing
    //*************************************************************************
    list_merge: function ( format_str, list_input_1, list_input_2, list_input_3, list_input_4, list_input_5, list_result ) {
        var list_in_1_text = QMedialon.GetValueAsString(list_input_1 + ".Text");
        var list_in_2_text = QMedialon.GetValueAsString(list_input_2 + ".Text");
        var list_in_3_text = QMedialon.GetValueAsString(list_input_3 + ".Text");
        var list_in_4_text = QMedialon.GetValueAsString(list_input_4 + ".Text");
        var list_in_5_text = QMedialon.GetValueAsString(list_input_5 + ".Text");
        //*********************************************************************
        // get number of %% caracters in the format string
        var count = 0;
        var foundAtPosition = 0;
        while ( foundAtPosition != -1) {
            foundAtPosition = format_str.indexOf('%%', foundAtPosition);
            if (foundAtPosition != -1) {
                count++;
                foundAtPosition += 2;
            }
        }
        //*********************************************************************
        // replace %% by a token ( "PERCENT" + NUM )
        var per_cent = "PERCENT";
        var f = 0;
        var i = 0;
        // change the token until is sure not exists in the format string
        while ( f >= 0 ) {
            per_cent += i;
            f = format_str.indexOf(per_cent);
            i++;
        }
        //*********************************************************************
        // replace all %% by the new unique token
        for (i = 0; i < count; i++) {
            var string_str = format_str.replace('%%', per_cent);
            format_str = string_str;
        }
        //*********************************************************************
        // split the format string by %
        var split_string = new Array();
        split_string = format_str.split('%');
        //*********************************************************************
        // restore to % if exists
        for (i = 0; i < split_string.length; i++) {
            foundAtPosition = 0;
            while (foundAtPosition != -1) {
                foundAtPosition = split_string[i].indexOf(per_cent, foundAtPosition);
                if (foundAtPosition != -1) {
                    split_string[i] = split_string[i].replace(per_cent, '%');
                    foundAtPosition += per_cent.length;
                }
            }
        }
        //*********************************************************************
        // new arrays
        var split_list_1 = new Array();
        var split_list_2 = new Array();
        var split_list_3 = new Array();
        var split_list_4 = new Array();
        var split_list_5 = new Array();
        // 1
        split_list_1 = list_in_1_text.split('\r\n');
        // delete last item because is always empty
        split_list_1.splice(split_list_1.length-1, 1);
        // 2
        split_list_2 = list_in_2_text.split('\r\n');
        split_list_2.splice(split_list_2.length-1, 1);
        // 3
        split_list_3 = list_in_3_text.split('\r\n');
        split_list_3.splice(split_list_3.length-1, 1);
        // 4
        split_list_4 = list_in_4_text.split('\r\n');
        split_list_4.splice(split_list_4.length-1, 1);
        // 5
        split_list_5 = list_in_5_text.split('\r\n');
        split_list_5.splice(split_list_5.length-1, 1);
        //*********************************************************************
        // find for the longest array
        var max = Math.max(split_list_1.length, split_list_2.length, split_list_3.length, split_list_4.length, split_list_5.length );
        //*********************************************************************
        // merge in a new array
        var result_list_str = new Array();
        for (i = 0; i < max; i++) {
            if ( split_string.length > 1 ) {
                if ( split_string[0] != "" )
                    result_list_str[i] = split_string[0];
                if ( i < split_list_1.length )
                    result_list_str[i] += split_list_1[i];
            }
            if ( split_string.length > 2 ) {
                result_list_str[i] += split_string[1];
                if ( i < split_list_2.length )
                    result_list_str[i] += split_list_2[i];
            }
            if ( split_string.length > 3 ) {
                result_list_str[i] += split_string[2];
                if ( i < split_list_3.length )
                    result_list_str[i] += split_list_3[i];
            }
            if ( split_string.length > 4 ) {
                result_list_str[i] += split_string[3];
                if ( i < split_list_4.length )
                    result_list_str[i] += split_list_4[i];
            }
            if ( split_string.length > 5 ) {
                result_list_str[i] += split_string[4];
                if ( i < split_list_5.length )
                    result_list_str[i] += split_list_5[i];
            }
        }
        //*********************************************************************
        // assemble as a manager list
        var result = result_list_str.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_result + ".Text", result );
        return "";
    },
    ///////////////////////////////////////////////////////////////////////////
    //*************************************************************************
    // LIST REMOVE - TWO DIFERENT FUNCTIONS, REMOVE EMPTY AND REMOVE DUPLICATES
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // these functions will remove empty or duplicate items from a list
    // input parametres: list name in
    // required: the input
    // returns: nothing
    //*************************************************************************
    list_remove_empty: function ( list_input ) {
        var list_input_text = QMedialon.GetValueAsString(list_input + ".Text");
        var split_list = new Array();
        // convert to array
        split_list = list_input_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1);
        // get its length
        var list_length = split_list.length;
        //*********************************************************************
        var index = -1;
        var resIndex = -1;
        var new_list = new Array();
        var value = "";
        // remove empties
        while (++index < list_length) {
            value = split_list[index];
            if (value) {
                new_list[++resIndex] = value;
            }
        }
        //*********************************************************************
        // assemble as a manager list
        var result = new_list.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_input + ".Text", result );
        return "";
    },
    //*************************************************************************
    // remove duplicates
    list_remove_duplicates: function ( list_input ) {
        var list_input_text = QMedialon.GetValueAsString(list_input + ".Text");
        var split_list = new Array();
        // convert to array
        split_list = list_input_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1);
        //*********************************************************************
        // remove duplicates
        var new_object_list = {};
        split_list.forEach(
            function (i) {
                if (!new_object_list[i]) {
                    new_object_list[i] = true;
                }
            });
        // get the key elements who are true
        var result_list = Object.keys(new_object_list);
        //*********************************************************************
        // assemble as a manager list
        var result = result_list.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_input + ".Text", result );
        return "";
    },
    ///////////////////////////////////////////////////////////////////////////
    //*************************************************************************
    // LIST RESIZE - TWO DIFERENT FUNCTIONS, RESIZE FROM TOP AND RESIZE FROM BOTTOM
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // these functions resize a list to a specific number of indexes
    // input parametres: list name in, index, pad string
    // required: the firts two inputs
    // returns: if exist error
    //*************************************************************************
    list_resize_top: function ( list_input, new_size, pad_str  ) {
        var list_input_text = QMedialon.GetValueAsString(list_input + ".Text");
        // test index
        if ( new_size != "" ) {
            var size = parseInt(new_size, 10);
            if ( isNaN(size))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        //
        var split_list = new Array();
        // convert to array
        split_list = list_input_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1);
        // get its length
        var list_length = split_list.length;
        //*********************************************************************
        if ( list_length - size >= 0 ) {
            var crop = list_length - size;
            split_list.splice( 0, crop );
        }
        else {
            var add = size - list_length;
            for (var i = 0; i < add; i++) {
                split_list.splice( 0 + i, 0, pad_str );
            }
        }
        //*********************************************************************
        // assemble as a manager list
        var result = split_list.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_input + ".Text", result );
    },
    //*************************************************************************
    list_resize_bottom: function ( list_input, new_size, pad_str  ) {
        var list_input_text = QMedialon.GetValueAsString(list_input + ".Text");
        if ( new_size != "" ) {
            var size = parseInt(new_size, 10);
            if ( isNaN(size))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        //
        var split_list = new Array();
        // convert to array
        split_list = list_input_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1);
        // get its length
        var list_length = split_list.length;
        //*********************************************************************
        if ( list_length - size >= 0 ) {
            var crop = list_length - size;
            split_list.splice( size, crop );
        }
        else {
            var add = size - list_length;
            for (var i = 0; i < add; i++) {
                split_list.splice( list_length + i, 0, pad_str );
            }
        }
        //*********************************************************************
        // assemble as a manager list
        var result = split_list.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_input + ".Text", result );
        return "";
    },
    ///////////////////////////////////////////////////////////////////////////
    //*************************************************************************
    // LIST REVERSE
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // this function reverses the order of a list
    // input parametres: list input
    // required: the input
    // returns: nothing
    //*************************************************************************
    list_reverse: function ( list_input  ) {
        var list_input_text = QMedialon.GetValueAsString(list_input + ".Text");
        var split_list = new Array();
        // convert to array
        split_list = list_input_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1);
        // get its length
        var list_length = split_list.length;
        //*********************************************************************
        // reverse
        var new_list = new Array();
        for ( var i=0; i<list_length; i++ )
            new_list[i] = split_list[list_length-i-1];
        //*********************************************************************
        // assemble as a manager list
        var result = new_list.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_input + ".Text", result );
        return "";
    },
    ///////////////////////////////////////////////////////////////////////////
    //*************************************************************************
    // LIST SEARCH - TWO DIFERENT FUNCTIONS, SEARCH WHOLE AND SEARCH PARTIAL
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // these functions search a specific term in a list
    // return index and return string are defined in the manager device area of the script
    // input parametres: list name in, index, search_term
    // required: all three inputs
    // returns: if exist error
    //*************************************************************************
    // search whole
    list_search_whole: function ( list_input, index, search_term ) {
        var list_input_text = QMedialon.GetValueAsString(list_input + ".Text");
        // test index
        if ( index != "" ) {
            var index = parseInt(index, 10);
            if ( isNaN(index))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        //
        var split_list = new Array();
        // convert to array
        split_list = list_input_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1);
        // get its length
        var list_length = split_list.length;
        //*********************************************************************
        this.Device.search_str = "";
        this.Device. search_index = -1;
        if ( index < list_length ){
            for ( var i=index; i<list_length; i++ )
            {   if ( split_list[i] == search_term )
                {   this.Device.search_str = split_list[i];
                    this.Device. search_index = i;
                    break;
                }
            }
        }
        return "";
    },
    //*************************************************************************
    // search partial
    list_search_partial: function ( list_input, index, search_term ) {
        var list_input_text = QMedialon.GetValueAsString(list_input + ".Text");
        if ( index != "" ) {
            var index = parseInt(index, 10);
            if ( isNaN(index))
                return this.error_is_not_int;
        }
        else
            return this.error_empty;
        //
        var split_list = new Array();
        // convert to list
        split_list = list_input_text.split('\r\n');
        // delete last item because is always empty
        split_list.splice(split_list.length-1, 1);
        // get its length
        var list_length = split_list.length;
        //*********************************************************************
        this.Device.search_str = "";
        this.Device. search_index = -1;
        if ( index < list_length ){
            for ( var i=index; i<list_length; i++ )
            {   foundAtPosition =split_list[i].indexOf( search_term );
                if ( foundAtPosition != -1 )
                {   this.Device.search_str = split_list[i];
                    this.Device. search_index = i;
                    break;
                }
            }
        }
        return "";
        //*********************************************************************
    },
    ///////////////////////////////////////////////////////////////////////////
    //*************************************************************************
    // LIST SORT - TWO DIFERENT FUNCTIONS, SORT ASCENDENT AND SORT DESCENDENT
    //*************************************************************************
    ///////////////////////////////////////////////////////////////////////////
    // these functions sort a list and sync-sort other â�?�?childâ�?�? lists to the â�?�?parentâ�?�? one
    // input parametres: list parent, and list child if they are
    // required: list parent input
    // returns: if exist error
    //*************************************************************************
    // sort alfabeticaly ascendent
    list_sort_alfab_ascen: function ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5 ) {
        return this._list_sort ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5, "alfab_ascen" )
    },
    // sort alfabeticaly descendent
    list_sort_alfab_descen: function ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5 ) {
        return this._list_sort ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5, "alfab_descen" )
    },
    // sort numericaly ascendent
    list_sort_num_ascen: function ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5 ) {
        return this._list_sort ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5, "num_ascen" )
    },
    // sort numericaly descendent
    list_sort_num_descen: function ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5 ) {
        return this._list_sort ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5, "num_descen" )
    },
    // sort randomly
    list_sort_random: function ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5 ) {
        return this._list_sort ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5, "random" )
    },
    //*************************************************************************
    // private function
    _list_sort: function  ( list_parent, list_child_1, list_child_2, list_child_3, list_child_4, list_child_5, sort_type ) {
        var list_parent_text = QMedialon.GetValueAsString(list_parent + ".Text");
        var list_child_1_text = QMedialon.GetValueAsString(list_child_1 + ".Text");
        var list_child_2_text = QMedialon.GetValueAsString(list_child_2 + ".Text");
        var list_child_3_text = QMedialon.GetValueAsString(list_child_3 + ".Text");
        var list_child_4_text = QMedialon.GetValueAsString(list_child_4 + ".Text");
        var list_child_5_text = QMedialon.GetValueAsString(list_child_5 + ".Text");
        // new arrays
        var split_list_0 = new Array();
        var split_list_1 = new Array();
        var split_list_2 = new Array();
        var split_list_3 = new Array();
        var split_list_4 = new Array();
        var split_list_5 = new Array();
        // convert lists to arrays
        split_list_0 = list_parent_text.split('\r\n');
        split_list_1 = list_child_1_text.split('\r\n');
        split_list_2 = list_child_2_text.split('\r\n');
        split_list_3 = list_child_3_text.split('\r\n');
        split_list_4 = list_child_4_text.split('\r\n');
        split_list_5 = list_child_5_text.split('\r\n');
        // delete last item because is always empty
        split_list_0.splice(split_list_0.length-1, 1);
        split_list_1.splice(split_list_1.length-1, 1);
        split_list_2.splice(split_list_2.length-1, 1);
        split_list_3.splice(split_list_3.length-1, 1);
        split_list_4.splice(split_list_4.length-1, 1);
        split_list_5.splice(split_list_5.length-1, 1);
        // get their lengths
        var len_0 = split_list_0.length;
        var len_1 = split_list_1.length
        var len_2 = split_list_2.length
        var len_3 = split_list_3.length
        var len_4 = split_list_4.length
        var len_5 = split_list_5.length
        //****************************************************************
        // check if all lists, who are not empty, have the same length
        var max = 1;
        var min = 0;
        if (len_0 > 0) {
            max = len_0;
            min = len_0;
            if (len_1 > 0) {
                max = Math.max(len_0, len_1 );
                min = Math.min(len_0, len_1 );
                if (len_2 > 0) {
                    max = Math.max(len_0, len_1, len_2 );
                    min = Math.min(len_0, len_1, len_2 );
                    if (len_3 > 0) {
                        max = Math.max(len_0, len_1, len_2, len_3 );
                        min = Math.min(len_0, len_1, len_2, len_3 );
                        if (len_4 > 0) {
                            max = Math.max(len_0, len_1, len_2, len_3, len_4 );
                            min = Math.min(len_0, len_1, len_2, len_3, len_4 );
                            if (len_5 > 0) {
                                max = Math.max(len_0, len_1, len_2, len_3, len_4, len_5);
                                min = Math.min(len_0, len_1, len_2, len_3, len_4, len_5);
                            }
                        }
                    }
                }
            }
        }
        if (max != min) {
            // cancel
            return this.error_different_sizes;
        }
        //****************************************************************
        // create a 2 dimensional array of parent length  - with parent data ( in [0] ) and a index ( in [1] )
        var index_array = new Array();
        for (var i = 0; i < len_0; i++) {
            index_array[i] = new Array();
            index_array[i][0] = split_list_0[i];
            index_array[i][1] = i;
        }
        // sort the 2 dimensional array 
        if ( sort_type == "alfab_ascen" ){
            index_array.sort();
        }
        else if ( sort_type == "alfab_descen" ){
            index_array.sort();
            index_array.reverse();
        }   
        else if ( sort_type == "num_ascen"){
            index_array.sort(
                function (a, b) {
                    var r =  a[0] - b[0];
                    // to prevent manager crash if they are not numbers
                    if ( isNaN( r ))
                        return 0;
                    return r;
                    });
        }
        else if ( sort_type == "num_descen"){
            index_array.sort(
                function (a, b) {
                    var r =  a[0] - b[0];
                    if ( isNaN( r ))
                        return 0;
                    return r;
                    });
            index_array.reverse();
        }
        else if ( sort_type == "random"){
            index_array.sort(
                function (a, b) {
                    return 0.5 - Math.random();
                    });
        }
        //*****************************************************************
        // new result arrays
        var result_parent = new Array();
        var result_child_1 = new Array();
        var result_child_2 = new Array();
        var result_child_3 = new Array();
        var result_child_4 = new Array();
        var result_child_5 = new Array();
        // sort all the lists with the new order
        for (i = 0; i < len_0; i++) {
            result_parent[i] = split_list_0[index_array[i][1]];
            result_child_1[i] = split_list_1[index_array[i][1]];
            result_child_2[i] = split_list_2[index_array[i][1]];
            result_child_3[i] = split_list_3[index_array[i][1]];
            result_child_4[i] = split_list_4[index_array[i][1]];
            result_child_5[i] = split_list_5[index_array[i][1]];
        }
        //*********************************************************************
        // assemble as a manager lists
        var result = result_parent.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_parent + ".Text", result );
        //
        result = result_child_1.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_child_1 + ".Text", result );
        //
        result = result_child_2.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_child_2 + ".Text", result );
        //
        result = result_child_3.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_child_3 + ".Text", result );
        //
        result = result_child_4.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_child_4 + ".Text", result );
        //
        result = result_child_5.join("\r\n");
        result += "\r\n";
        QMedialon.SetValue (list_child_5 + ".Text", result );
        return "";
    },
})