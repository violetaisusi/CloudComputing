//the document ready function
try	{
	$(function()
		{
		init();
		}
	);
	} catch (e)
		{
		alert("*** jQuery not loaded. ***");
		}

//
// Initialise page.
//
function init()
{
//disable all cache in browser
$.ajaxSetup({cache:false});
//make dialog box
$("#itemDetails").dialog({	modal:true,			//modal dialog to disable parent when dialog is active
							autoOpen:false,		//set autoOpen to false, hidding dialog after creation
							title: "Bid an Item",	//set title of dialog box
							minWidth: 600,
							minHeight: 400						
						}
						);

//make dialog box
$("#itemNew").dialog({	modal:true,			//modal dialog to disable parent when dialog is active
							autoOpen:false,		//set autoOpen to false, hidding dialog after creation
							title: "List an Item for Auction",	//set title of dialog box
							minWidth: 600,
							minHeight: 300						
						}
						);

//set click handler of Add Item button
$("#addItem").click(function()
				{
				//reset input texts
				$("#seller").val("");
				$("#title").val("");
				$("#stprice").val("");
				$("#description").val("");
				
				//initialize datepicker to today date
				$("#deadline").datepicker({dateFormat:"yy-mm-dd"});
				$("#deadline").datepicker( $.datepicker.regional["uk"] );
				$("#deadline").datepicker("setDate", new Date());
				
				//initialize spinners to now time
				$("#hour").spinner();
				$("#hour").spinner("value",new Date().getHours());
				$("#minutes").spinner();
				$("#minutes").spinner("value",new Date().getMinutes());
				$("#hour").spinner({icons:{down:"ui-icon-carat-1-s",up:"ui-icon-carat-1-n"}});
				$("#minutes").spinner({icons:{down:"ui-icon-carat-1-s",up:"ui-icon-carat-1-n"}});
				$( "#hour" ).spinner({max: 24});
				$( "#hour" ).spinner({min: 0});
				$( "#minutes" ).spinner({max: 60});
				$( "#minutes" ).spinner({min: 0});
	
				$("#itemNew").dialog("open",true);	//open dialog box
				}
			);

//set click handler of Refresh button in index.html
$("#refreshList").click(function()
						{
						//list saved items in ascending order of their deadline
						populateItems();
						}
					);


$("#closeBid").click(function()
		{
		$("#itemDetails").dialog("close");
		}
	);
//set click handler of Cancel button in Add Item dialog
$("#cancelItem").click(function()
						{
						$("#itemNew").dialog("close");
						}
					);

//save bid
$("#placeBid").click(function()
		{
		var idItem=$("#idItem").val();
		var bidder=$("#bidder").val();
		var amount=$("#amount").val();
		var currentPrice=$("#currentPrice").val();
		
		
		if(idItem=="" || bidder=="" || amount==0)
			alert("All information is required, please, fill it.");
		else if(Number(currentPrice)>Number(amount))
			alert("The bid has to be higher than the current price. Please, rise your bid.");
		else
			saveBid(idItem,bidder,amount);	//save Bid to web service	
		}
	);

//saveBid(idItem,bidder,amount);	//save Bid to web service
function saveBid(idItem,bidder,amount)
{		
	//alert("saveBid idItem="+idItem+" bidder="+bidder+" amount="+amount);
		$.ajaxSetup({cache:false});
		var url="/abay";					//URL of web service
		var data={	"idItem":idItem,				//request parameters as a map
					"bidder":bidder,
					"amount":amount
				};				
		//alert("seller "+seller+" title "+title+" stprice "+stprice+" description "+description+" dateTime "+dateTime);
		var settings={	"type":"POST",
				        "data":data,
				        "success":function(anyData,respStatus,jqXHR)
							{
				        	alert("Bid saved successfully");
				        	//alert("status "+respStatus+" Item saved: "+seller+" "+seller+" "+title+" "+title+" "+" "+stprice+" "+stprice+" "+description+" "+description+" "+dateTime+" "+dateTime);				        	
							},
						"error":function(xhr,status,error)
							{
							alert("ERROR status "+error);
							//$("#response textarea").val("Status: "+status+"\nDetails: "+error);
							},
						"complete":function(){
							//list saved items in ascending order of their deadline
				        	//populateSelect(seller,title,stprice,description,dateTime);
							//alert("completed bid");
						}
			};
		$.ajax(url,settings);
}//end saveBid

//set click handler of Save button in Add Item dialog
$("#saveItem").click(function()
		{		
		var seller=$("#seller").val();
		var title=$("#title").val();
		var stprice=$("#stprice").val();
		var description=$("#description").val();
		
		var deadline=$("#deadline").val();
		var hour=$("#hour").spinner( "value" )+"";
		var minutes=$("#minutes").spinner( "value" )+"";
		
		if(hour > 24 || hour < 0)
			alert("Hours must to be between 0 and 24, please, change it.");
		
		if(minutes > 60 || minutes < 0)
				alert("Minutes must to be between 0 and 60, please, change it.");			
		
		if (hour.length < 2) hour = "0"+hour;
		if (minutes.length < 2) minutes = "0"+minutes;				
		
		//"2015-04-21T11:13:00"
		var dateTime = deadline + "T" + hour+":"+minutes+":00";		
		//convert date time in string to long 
		//alert("dateTime="+dateTime);
		var dateTimeLong = new Date(dateTime).getTime(); 
		//alert("dateTime="+dateTime+"dateTimeLong="+dateTimeLong);
			if(seller=="" || title=="" || stprice==0 || description=="" || dateTimeLong==0){
				alert("All information is required, please, fill it.");
		    }else{
		    	
				saveItem(seller,title,stprice,description,dateTimeLong);	//save item to web service
				$("#itemNew").dialog("close");								
			}
		}				
		);//end click #saveItem

//list saved items in ascending order of their deadline
populateItems();
}




//saveItem(seller,title,stprice,description,dateTime,);	//save item to web service
function saveItem(seller,title,stprice,description,dateTime)
{		
	//alert("before going "+seller+" "+seller+" "+title+" "+title+" "+" "+stprice+" "+stprice+" "+description+" "+description+" "+dateTime+" "+dateTime);
		$.ajaxSetup({cache:false});
		var url="/abay";					//URL of web service
		var data={	"seller":seller,				//request parameters as a map
					"title":title,
					"stprice":stprice,
					"description":description,
					"dateTime":dateTime
				};				
		//alert("seller "+seller+" title "+title+" stprice "+stprice+" description "+description+" dateTime "+dateTime);
		var settings={	"type":"POST",
				        "data":data,
				        "success":function(anyData,respStatus,jqXHR)
							{
				        	//alert("status "+respStatus+" Item saved: "+seller+" "+seller+" "+title+" "+title+" "+" "+stprice+" "+stprice+" "+description+" "+description+" "+dateTime+" "+dateTime);				        	
							},
						"error":function(xhr,status,error)
							{
							alert("ERROR status "+error);
							//$("#response textarea").val("Status: "+status+"\nDetails: "+error);
							},
						"complete":function(){
							//list saved items in ascending order of their deadline
				        	populateSelect(seller,title,stprice,description,dateTime);
						}
			};
		$.ajax(url,settings);
}
function populateSelect(pseller,ptitle,stprice,pdescription,dateTimeLong)
{
	//disable all cache in browser
	$.ajaxSetup({cache:false});
	
	var url="/abay";		//URL of Abay service	
	//use jQuery shorthand Ajax function to get JSON data
	$.getJSON(url,				//URL of service
			function(itemsjson)		//successful callback function
			{			
		 	var items = $.parseJSON(itemsjson);
			$("#tblAllItems").empty();		//find city list and remove its children
			for (var i in items)
			  {
				var item=items[i];		//get 1 item from the JSON list
				
				var id=item.id;		//get item ID stored in seller from JSON data				
				var title=item.title;	//get city name from JSON data
				var seller=item.seller;
				var description=item.description;
				var price=item.currentPrice;
				var deadline=item.deadline;				
				var deadlineDate = new Date(Number(deadline));
				var year = deadlineDate.getFullYear();
				var month = deadlineDate.getMonth()+1;
				var day = deadlineDate.getDate();
				var hour = deadlineDate.getHours()+"";
				var min = deadlineDate.getMinutes()+"";
				var hours ="";var minutes ="";
				if (hour.length < 2) hours="0"+hour; else hours = hour;
				if (min.length < 2) minutes="0"+min; else minutes = min;		
				
				var deadlineFormated = year+"-"+month+"-"+day+" "+hours+":"+ minutes
				//alert("deadlineFormated="+deadlineFormated);			
				//compose HTML of a table with links of each item using the id, deadline, item title and price.
				if (i==0){
					var htmlHeader ="<tr><th>Deadline</th><th>Item</th><th>Current Price</th></tr>";
					$("#tblAllItems").append(htmlHeader);
				}
				
				var htmlTable ="";								

				if (seller==pseller && title==ptitle && price==stprice && description==pdescription && deadline==dateTimeLong){					
					htmlTable ="<tr bgcolor='LightGreen'><td><a href=javascript:itemClicked("+id+")>"+deadlineFormated+"</a></td><td><a href=javascript:itemClicked("+id+")>"+title+"</a></td><td><a href=javascript:itemClicked("+id+")>"+price+"</a></td></tr>";
					alert("refreshing cache");
				}else{
					//alert("down");
					htmlTable ="<tr  bgcolor='LightGrey'><td><a href=javascript:itemClicked("+id+")>"+deadlineFormated+"</a></td><td><a href=javascript:itemClicked("+id+")>"+title+"</a></td><td><a href=javascript:itemClicked("+id+")>"+price+"</a></td></tr>";
				}
				
				$("#tblAllItems").append(htmlTable);	//add a child to the items list*/
			  }//end for
			}//end function			
			) //end GetJSON callback function*/		
}
//list saved items in ascending order of their deadline
function populateItems()
{
	//disable all cache in browser
	$.ajaxSetup({cache:false});
	
	var url="/abay";		//URL of Abay service	
	//use jQuery shorthand Ajax function to get JSON data
	$.getJSON(url,				//URL of service
			function(itemsjson)		//successful callback function
			{			
			//alert("itemsjson="+itemsjson);
		    var items = $.parseJSON(itemsjson);
			$("#tblAllItems").empty();		//find city list and remove its children
			for (var i in items)
			  {
				var item=items[i];		//get 1 item from the JSON list
				
				var id=item.id;		//get item ID stored in seller from JSON data				
				var title=item.title;	//get city name from JSON data
				var price=item.currentPrice;
				var deadline=item.deadline;				
				var deadlineDate = new Date(Number(deadline));
				var year = deadlineDate.getFullYear();
				var month = deadlineDate.getMonth()+1;
				var day = deadlineDate.getDate();
				var hour = deadlineDate.getHours()+"";
				var min = deadlineDate.getMinutes()+"";
				var hours ="";var minutes ="";
				if (hour.length < 2) hours="0"+hour; else hours = hour;
				if (min.length < 2) minutes="0"+min; else minutes = min;		
				
				var deadlineFormated = year+"-"+month+"-"+day+" "+hours+":"+ minutes
				//compose HTML of a table with links of each item using the id, deadline, item title and price.
				if (i==0){
					var htmlHeader ="<tr><th>Deadline</th><th>Item</th><th>Current Price</th></tr>";
					$("#tblAllItems").append(htmlHeader);
				}
				var htmlTable ="<tr bgcolor='LightGrey'><td><a href=javascript:itemClicked("+id+")>"+deadlineFormated+"</a></td><td><a href=javascript:itemClicked("+id+")>"+title+"</a></td><td><a href=javascript:itemClicked("+id+")>"+price+"</a></td></tr>";
				$("#tblAllItems").append(htmlTable);	//add a child to the items list*/
			  }//end for
						
			}//end function			
			) //end GetJSON callback function*/				
}//end of populateItems

function itemClicked(id){
	//alert("id in fuction with changes"+id);
	
	//disable all cache in browser
	$.ajaxSetup({cache:false});
	
	var url = "/abay/"+id
	
	//use jQuery shorthand Ajax function to get JSON data
	$.getJSON(url,				//URL of service
			function(itemBidjson)		//successful callback function
			{			
			//alert("itemBidjson="+itemBidjson);
				
			 	var itemjson = $.parseJSON(itemBidjson);
							
			    var id=itemjson.id;
				var seller=itemjson.seller;
				var title=itemjson.title;	//get city name from JSON data
				var price=itemjson.currentPrice;
				var description=itemjson.description;								
				var deadline=itemjson.deadline;	
				
				var deadlineDate = new Date(Number(deadline));					
				
				var hour = deadlineDate.getHours()+"";
				var min = deadlineDate.getMinutes()+"";
				
								
				var hours ="";var minutes ="";
				if (hour.length < 2) hours="0"+hour; else hours = hour;
				if (min.length < 2) minutes="0"+min; else minutes = min;
				
				//var deadlineFormated = year+"-"+month+"-"+day+" "+hours+":"+ minutes
				//alert("hour="+hour+"min="+min+"deadlineFormated="+deadlineFormated);
				
				var numBid = itemjson.numBid;
				
				var winner = itemjson.winner;
				
				
				if(deadlineDate < new Date())
					alert("The deadline for this item is done. You can't bid for this item now.");
				else 							
					openBid(id,seller,title,price,description,deadlineDate,hours,minutes,numBid,winner);
					
				}//end function			
			) //end GetJSON callback function*/					
}

function openBid(id,seller,title,price,description,deadlineDate,hours,minutes,numBid,winner)
{
	//alert("opening");
	//fill input texts
	$("#idItem").val(id);
	$("#sellerB").val(seller);
	$("#titleB").val(title);
	$("#currentPrice").val(price);
	$("#descriptionB").val(description);
	$("#winner").val(winner);
	$("#numBid").val(numBid);
	
	$("#idItem").hide();
	$("#sellerB").prop("disabled",true);
	$("#titleB").prop("disabled",true);
	$("#currentPrice").prop("disabled",true);
	$("#descriptionB").prop("disabled",true);
	$("#winner").prop("disabled",true);
	$("#numBid").prop("disabled",true);
	
	//initialize datepicker to today date
	$("#deadlineB").datepicker({dateFormat:"yy-mm-dd"});
	$("#deadlineB").datepicker( $.datepicker.regional["uk"] );
	$("#deadlineB").datepicker("setDate", new Date(deadlineDate));
	$("#deadlineB").datepicker( "option", "disabled", true );
	
	//initialize spinners to now time
	$("#hourB").spinner();
	$("#hourB").spinner("value",hours);
	$("#minutesB").spinner();
	$("#minutesB").spinner("value",minutes);
	$("#hourB").spinner({icons:{down:"ui-icon-carat-1-s",up:"ui-icon-carat-1-n"}});
	$("#minutesB").spinner({icons:{down:"ui-icon-carat-1-s",up:"ui-icon-carat-1-n"}});
	$( "#hourB" ).spinner({max: 24});
	$( "#hourB" ).spinner({min: 0});
	$( "#minutesB" ).spinner({max: 60});
	$( "#minutesB" ).spinner({min: 0});
	$( "#hourB" ).spinner("disable");
	$( "#minutesB" ).spinner("disable");
	
	$("#itemDetails").dialog("open",true);	//open dialog box	
}
