$(document).ready(function(){
    var detailButton = document.querySelector("#details");
    var table = document.querySelector("#tablo");
    var text = document.querySelector("#detailText");
    var calculate = document.querySelector("#calculate");
    var interestt = document.querySelector("#interest");
    var input1 = document.querySelector("#loan");
    var input2 = document.querySelector("#term");
    var payment = document.querySelector("#payment");
    var tableRef = document.getElementById('myTable').getElementsByTagName('tbody')[0];
    
    
    detailButton.addEventListener("click",function(){
        if(text.innerHTML == "Show"){
            table.style.display = "block";
            text.innerHTML = "Hide";
        }
        else{
            table.style.display = "none";
            text.innerHTML = "Show";
        }
    });
    calculator();
    calculate.addEventListener("click",calculator);
    


function calculator(){
    var amount = Number(input1.value);
    var term = Number(input2.value);
    var interest = Number(interestt.innerHTML)/100;        
    var result = (amount*interest*Math.pow((1+interest),term))/(Math.pow((1+interest),term)-1);
    payment.innerHTML = result.toFixed(2);
    
    $("#myTable tbody tr").remove();
    var row = tableRef.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    cell1.innerHTML = "Total";
    cell2.innerHTML = (result*term).toFixed(0);
    cell3.innerHTML = (result*term - amount).toFixed(0)
    cell4.innerHTML = amount.toFixed(2)
    cell5.innerHTML = "-";
    var principal = amount;
    for(var i=1; i<=term; i++){
        var faizodeme = principal*interest;
        var row = tableRef.insertRow(i);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        cell1.innerHTML = i;
        cell2.innerHTML = result.toFixed(2);
        cell3.innerHTML = faizodeme.toFixed(2);
        cell4.innerHTML = (result-faizodeme).toFixed(2);
        principal = principal-result+faizodeme;
        cell5.innerHTML = principal.toFixed(2);
    }
}
});

    

