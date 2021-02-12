$( document ).ready(function() {
    
    // hiding fillter Inputs
    $('#dateIdTo').hide();
    $('#dateIdFrom').hide();
    $('#memeId').hide();
    $('.crioLogoDiv').hide();
    $('.loader').hide();
    
    // Selecting by ID where to dynamically placing the memes
    var memeOutput = $(".meme-output");

    // For Storing Meme Data
    var outputData = [];

    //For Storing Meme Data After Applying filters
    var filterOutputData = [];

    //Get Request Function for Getting Meme - Data
    var GetRequest = ()=>{

        //Ajax call Sync GET Request
        $.ajax({
            type: 'GET',
            url: "https://xmeme-nitish.herokuapp.com/memes/time",
            async: false,
            success: function(data){

                // Data is Stored in outputData
                outputData = data;
            }
        });
    }

    //Function For Validating Images returns A Promise Which will be used to validate An image
    var validateImageURL = async (src) =>{
    
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => resolve('loaded');
            img.onerror = reject;
            img.src = src;
          });
    }

    //Function To Display Memes
    var DisplayMemes = (MemeData) => {

                    // Erasing the data which is already present in Id memeOutput
                    memeOutput.empty();

                    // Diplaying the Memes which are present till Now (latest 100)In Database
                    MemeData.forEach(data => {
                        memeOutput.append('<div class='+data.id+'><div class="Oowner"><span class="OwnerName"><b>'+data.name+'</b></span><br><span class="timeOut">'+data.Dtime+'</span></div><div class="Ocaption">'+data.caption+'</div><div class="memeURL"><img src="'+data.url+'"></div><button class="EditMemeButton">Edit</button></div>');
                    });

                    // If no data is present, Then display this
                    if(MemeData.length == 0)
                    {
                        memeOutput.append('<div class="emptyData"><h4>Oops Nothing to display</h4></div>'); 
                    }

                    // Added OnClick EventListener For Edit Button Present for EveryMeme.
                    $(".EditMemeButton").on('click',async (event)=>{

                                // preventing Default Action
                                event.preventDefault();
                                
                                // Displaying Logo while editing
                                $('.crioLogoDiv').show();
                                $('.loader').show();
                                $('#submit').hide();

                                // Creating Prompt to take New caption and New URl as Input where then url and caption should not be empty() 
                                    var NewCaption = prompt("Enter New Caption:(If U Don't want to change caption press OK)", event.target.parentNode.childNodes[1].innerText);
                                    var NewURL = prompt("Enter New URL:(If U Don't want to change URL press OK)", event.target.parentNode.childNodes[2].childNodes[0].currentSrc);
                                
                                //Extracting Meme Id    
                                    var id = event.target.parentNode.className;
                                
                                // updateData -> is an object contains New url and caption and flag is for verifying whether to update meme or not    
                                    var updateData = {},flag = 0;
                                    if (NewCaption != null && NewCaption != "" )
                                    {
                                        updateData.caption = NewCaption;
                                        flag++;
                                    }
                                    else if(NewCaption == "" )
                                    {
                                        alert('Enter a Valid Caption');
                                    }
                                    if(NewURL != null && NewURL != "")
                                    {
                                        flag++;
                                        updateData.url = NewURL;
                                    }
                                    else if(NewURL == ""){
                                        alert('Enter a valid URL');
                                    }
                                    updateData.name = event.target.parentNode.childNodes[0].childNodes[0].innerText;

                                    //if flag == 2 that means user has given us correct information to update data
                                    if(flag == 2){
                                        
                                            try{ 
                                                // validating the URL if the user needs to change it
                                                flag = await validateImageURL(updateData.url);
                                            }catch(err){
                                                alert('Enter valid IMAGE URL');
                                            }

                                            // if the image url is validated then it returns "loaded" which gives us access to proccedd further
                                            if(flag === "loaded"){

                                                $.ajax({
                                                    type:'PATCH',
                                                    url:"https://xmeme-nitish.herokuapp.com/memes/"+id,
                                                    data:updateData,
                                                    success: function(response){
                                                        GetRequest();
                                                        //$(".EditMemeButton").off('click');
                                                        DisplayMemes(outputData);
                                                    },
                                                    error: function(xhr,statusText,errorThrown){
                                                        alert('Same Meme Present Already With same URL, caption and From The same USER');
                                                    } 
                                                });
                                            }
                                    }

                                    $('.crioLogoDiv').hide();
                                    $('.loader').hide();
                                    $('#submit').show();                
                    });

    }

    // GET REQUEST For getting the data that is stored in the database
    GetRequest();  
    DisplayMemes(outputData);

    $( "form" ).on('submit',async ( event ) => {  

                    // For preventing Default Action of the Browser
                    event.preventDefault();   

                    $('.crioLogoDiv').show();
                    $('.loader').show();
                    $('#submit').hide();

                    //storing the data entered by the user
                    var data={};
                    data.name = $("#owner").val();
                    data.url = $("#mUrl").val();
                    data.caption = $("#caption").val();

                    // flag is used for validating user
                    var flag ;
                    try{ 
                        flag = await validateImageURL(data.url);
                    }
                    catch(err){
                        alert('Enter a valid IMAGE URL');
                    }

                    if(flag === "loaded"){

                            // Endpoint for post Request    
                            var endpoits = "https://xmeme-nitish.herokuapp.com/memes?name="+data.name+"&url="+data.url+"&caption="+data.caption;
                            $.ajax({
                                type: 'POST',
                                url: endpoits,
                                async: false,
                                data:data,
                                success: function(data1){
                                    GetRequest();
                                },
                                error: function(xhr,statusText,errorThrown){
                                    alert('Try something New ');
                                }                       
                            });
                            DisplayMemes(outputData);
                    }  
                  
                    $('.crioLogoDiv').hide();
                    $('.loader').hide();
                    $('#submit').show();                  
                
    });

    // Fliters 
    $('select').on('change', function() {

            // Getting what type of filter is selected
            var x = $("#filterType").val();

            if(x == 'searchById')
            {
                // When We Need to Filter Using Id As a Parameter than we will hide input type="date"
                    $('#memeId').show();
                    $('#dateIdTo').hide();
                    $('#dateIdFrom').hide();
                    $("#filterButton").off('click');

                    //Event Listner For Button
                    $("#filterButton").on('click', () => {
                                $.ajax({
                                        type: 'GET',
                                        url: "https://xmeme-nitish.herokuapp.com/memes/time/"+$("#memeId").val(),
                                        async: false,
                                        success: function(data){                                                
                                                filterOutputData = data;
                                                DisplayMemes(filterOutputData);
                                                },
                                        error: function(xhr,statusText,errorThrown){
                                            DisplayMemes([]);
                                            alert('No Meme with the given ID');
                                            
                                        } 
                                });
                    });
        
            }
            else if(x == 'searchByName' )
            {
                $("#filterButton").off('click');
                $('#memeId').show();
                $('#dateIdTo').hide();
                $('#dateIdFrom').hide();
                $("#filterButton").on('click', () => {
                    
                            $.ajax({
                                        type: 'GET',
                                        url: "https://xmeme-nitish.herokuapp.com/memes/name/"+$("#memeId").val(),
                                        async: false,
                                        success: function(data){
                                            filterOutputData = data;
                                            DisplayMemes(filterOutputData);
                                        },
                                        error: function(xhr,statusText,errorThrown){
                                            DisplayMemes([]);
                                            alert('No Meme with the given Name');
                                            
                                        } 
                            });
                });
            }
            else if(x == 'timeInterval')
            {
                    $("#filterButton").off('click');
                    $('#memeId').hide();
                    $('#dateIdTo').show();
                    $('#dateIdFrom').show();

                    //   $("#filterButton").on('click', () => {
                        
                    //     var startDate = $('#dateIdFrom').val();
                    //     var endDate = $('#dateIdTo').val();
                    //     filterOutputData = outputData;
                    //     var resultMemeData = filterOutputData.filter(function (a) {
                    //         var hitDates = a.ProductHits || {};
                    //         // extract all date strings
                    //         hitDates = Object.keys(hitDates);
                    //         // convert strings to Date objcts
                    //         hitDates = hitDates.map(function(date) { return new Date(date); });
                    //         // filter this dates by startDate and endDate
                    //         var hitDateMatches = hitDates.filter(function(date) { return date >= startDate && date <= endDate });
                    //         // if there is more than 0 results keep it. if 0 then filter it away
                    //         return hitDateMatches.length>0;
                    //     });
                    //     console.log(resultMemeData);
                    //         });
            }
            else if(x == 'NoFilter')
            {
                $("#filterButton").off('click');
                $('#memeId').hide();
                $('#dateIdTo').hide();
                $('#dateIdFrom').hide();
                GetRequest();
                DisplayMemes(outputData);
            
            }
    });             
});


// {
//     id: 1,
//     name: "Nitish",
//     url:"https://www.w3schools.com/images/w3schools_green.jpg",
//     caption:"This is nitish",
//     Dtime:'2021/2/5  9:54 am'
// },
