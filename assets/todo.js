
var todo = todo || {},
    data = JSON.parse(localStorage.getItem("todoData"));
//Taking the already present data from the Local Storage
data = data || {};

//Defining the defaults so that they can be used everywhere
(function(todo, data, $) {

    var defaults = {
            todoTask: "todo-task",
            todoHeader: "task-header",
            todoDate: "task-date",
            todoDescription: "task-description",
            taskId: "task-",
            formId: "todo-form",
            dataAttribute: "data",
            deleteDiv: "delete-div"
        }, codes = {
            "1" : "#pending"
        };
//importing iptions and passing the data to be generated through generateElement function
    todo.init = function (options) {

        options = options || {};
        options = $.extend({}, defaults, options);

        $.each(data, function (index, params) {
            generateElement(params);
        });
//Configuring the drop when we drag can be integrated with the below function
        $.each(codes, function (index, value) {
            $(value).droppable({
                drop: function (event, ui) {
                        var element = ui.helper,
                            css_id = element.attr("id"),
                            id = css_id.replace(options.taskId, ""),
                            object = data[id];

                            removeElement(object);
                            object.code = index;
                            generateElement(object);
                            data[id] = object;
                            localStorage.setItem("todoData", JSON.stringify(data));
                            $("#" + defaults.deleteDiv).hide();
                    }
            });
        });
//Configuring the drop when dragged to RecycleBin for Deletion
        $("#" + options.deleteDiv).droppable({
            drop: function(event, ui) {
                var element = ui.helper,
                    css_id = element.attr("id"),
                    id = css_id.replace(options.taskId, ""),
                    object = data[id];
                    var d1=parseInt(object.date[0])*10+parseInt(object.date[1]);
                    var m1=parseInt(object.date[3])*10+parseInt(object.date[4]);
                    var y1=parseInt(object.date[6])*1000+parseInt(object.date[7])*100+parseInt(object.date[8])*10+parseInt(object.date[9]);

                var completion_time=new Date(y1, m1-1, d1, 0, 0, 0, 0).getTime();
                var today_time=new Date().getTime();
                if(today_time>completion_time)
                {
                removeElement(object);

                delete data[id];
                localStorage.setItem("todoData", JSON.stringify(data));
                }
                else
                {
                    removeElement(object);
                    object.code = 1;

                            generateElement(object);

                            data[id] = object;
                            localStorage.setItem("todoData", JSON.stringify(data));
                    var errorMessage = "Completion Date still not Achieved";
                    generateDialog(errorMessage);
                }

                $("#" + defaults.deleteDiv).hide();
            }
        })

    };
//Used to generate the To-Do list from the LocalStorage
    var generateElement = function(params){
        var parent = $(codes[params.code]),
            wrapper;

        if (!parent) {
            return;
        }

        wrapper = $("<div />", {
            "class" : defaults.todoTask,
            "id" : defaults.taskId + params.id,
            "data" : params.id
        }).appendTo(parent);

        $("<div />", {
            "class" : defaults.todoHeader,
            "text": params.title
        }).appendTo(wrapper);

        $("<div />", {
            "class" : defaults.todoDate,
            "text": params.today+"\t-\t"+params.date
        }).appendTo(wrapper);

        $("<div />", {
            "class" : defaults.todoDescription,
            "text": params.description
        }).appendTo(wrapper);

	    wrapper.draggable({
            start: function() {
                $("#" + defaults.deleteDiv).show();
            },
            stop: function() {
                $("#" + defaults.deleteDiv).hide();
            },
	        revert: "invalid",
	        revertDuration : 200
        });

    };
//used to remove tasks used in multiple function
    var removeElement = function (params) {
        $("#" + defaults.taskId + params.id).remove();
    };
//used to add the tasks to the local storage
    todo.add = function() {
        var inputs = $("#" + defaults.formId + " :input"),
            errorMessage = "Title can not be empty",
            id, title, description, date, tempData;

        if (inputs.length !== 4) {
            return;
        }
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;

        title = inputs[0].value;
        description = inputs[1].value.replace(/\s+/g,' ').trim();
        var j =description.length;
        for(var i=0;i<j;i++)
        {
            var start=i;
            var med=-1;
            var end=-1;    
            var len=0;
            
            while(description[i]!=' '&&i<j)
            {
                len++;
                if(len==30)
                {
                    med=i;
                }
                if(len>30)
                {
                    end=i;
                }
                i++;
            }
            console.log(description[start]);
            console.log(description.substr(start,end+1));
            console.log(description.substr(start,med+1));
            if(end!=-1)
            {
                description=description.replace(description.substr(start,end+1),description.substr(start,med+1));
                end=-1;
                med=-1;
            }
        }
        /*var set_of_words=[];
        for(var i=0;i<str_nospaces.length;i++)
        {
            var start =i;
            var med=-1;
            var length=0;
            while(str_nospaces[i]!=' '&&i<str_nospaces.size)
            {
                length++;
                if(length==30)
                {
                    med=i;
                }
                i++;
            }
            if(length<30)
            {
                med=i-1;
            }
            set_of_words.push(str_nospaces.substr(start,med));
        }
        var description;
        for(var i=0;i<set_of_words.length;i++)
        {
            description=description+set_of_words[i]+" ";
        }*/

        date = inputs[2].value;

        if (!title) {
            generateDialog(errorMessage);
            return;
        }

        id = new Date().getTime();

        tempData = {
            id : id,
            code: "1",
            title: title,
            date: date,
            description: description,
            today: today
        };

        data[id] = tempData;
        localStorage.setItem("todoData", JSON.stringify(data));

        generateElement(tempData);

        // Reset Form
        inputs[0].value = "";
        inputs[1].value = "";
        inputs[2].value = "";
    };
//For error messages
    var generateDialog = function (message) {
        var responseId = "response-dialog",
            title = "Message( Not a alert() :) )",
            responseDialog = $("#" + responseId),
            buttonOptions;

        if (!responseDialog.length) {
            responseDialog = $("<div />", {
                    title: title,
                    id: responseId
            }).appendTo($("body"));
        }

        responseDialog.html(message);

        buttonOptions = {
            "Ok" : function () {
                responseDialog.dialog("close");
            }
        };

	    responseDialog.dialog({
            autoOpen: true,
            width: 400,
            modal: true,
            closeOnEscape: true,
            buttons: buttonOptions
        });
    };
//to reset the whole thing
    todo.clear = function () {
        data = {};
        localStorage.setItem("todoData", JSON.stringify(data));
        $("." + defaults.todoTask).remove();
    };

})(todo, data, jQuery);
