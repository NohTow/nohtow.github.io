// function updateCounter(){
//     var stop_time = moment("2020-11-07 19:30")
//     //var stop_time = moment([2020, 10, 7]);
//     var today = moment();
//     years = today.diff(stop_time, "years");
//     today.subtract(years, "years")
//     months = today.diff(stop_time, "months")
//     today.subtract(months, "months")
//     weeks = today.diff(stop_time, "weeks")
//     today.subtract(weeks, "weeks")
//     days = today.diff(stop_time, "days")
//     today.subtract(days, "days")
//     hours = today.diff(stop_time, "hours")
//     today.subtract(hours, "hours")
//     minutes = today.diff(stop_time, "minutes")
//     today.subtract(minutes, "minutes")
//     seconds = today.diff(stop_time, "seconds")
//     document.getElementById("counter").innerHTML = "<strong>"+years+"</strong>" + " an(s) " + months + " mois " + weeks + " semaine(s) " + days + " jour(s) " + hours + " heure(s) "+ minutes + " minute(s) " + seconds + " seconde(s)";
// }
// updateCounter()
// setInterval(updateCounter, 1000)


var ringer = {
    //countdown_to: "10/31/2014",
    stop_time: moment("2020-11-07 19:30"),
    rings: {
			'YEARS':{
				s: 29030400000,
				max: 5
			},
			'MONTHS':{
				s: 2419200000,
				max: 12
			},
			'WEEKS':{
				s: 604800000,
				max: 4.0000001
			},
      'DAYS': { 
        s: 86400000, // mseconds in a day,
        max: 31
      },
      'HOURS': {
        s: 3600000, // mseconds per hour,
        max: 24
      },
      'MINUTES': {
        s: 60000, // mseconds per minute
        max: 60
      },
      'SECONDS': {
        s: 1000,
        max: 60
			},
     },
    r_count: 7,
    r_spacing: 10, // px
    r_size: 150, // px old : 100
    r_thickness: 5, // px
      
    init: function(){
     
      $r = ringer;
      $r.cvs = document.createElement('canvas'); 
      
      $r.size = { 
        w: ($r.r_size + $r.r_thickness) * $r.r_count + ($r.r_spacing*($r.r_count-1)), 
        h: ($r.r_size + $r.r_thickness) 
      };
      
  
  
      $r.cvs.setAttribute('width',$r.size.w);           
      $r.cvs.setAttribute('height',$r.size.h);
      $r.ctx = $r.cvs.getContext('2d');
      //$(document.body).append($r.cvs);
      $("#counter" ).append($r.cvs);
      $r.cvs = $($r.cvs);    
      $r.ctx.textAlign = 'center';
      $r.actual_size = $r.r_size + $r.r_thickness;
      $r.cvs.css({ width: $r.size.w+"px", height: $r.size.h+"px" });
      $r.go();
    },
    ctx: null,
    go: function(){
      var idx=0;
			//console.log(today);
			// $r.values["years"] = today.diff($r.stop_time, "years");
			// today.subtract(years, "years")
			// $r.values["months"] = today.diff($r.stop_time, "months");
			// today.subtract(months, "months")
			var today = moment();
			$r.values = {}
			years = today.diff($r.stop_time, "years");
			$r.values["YEARS"] = years
			today.subtract(years, "years");
			months = today.diff($r.stop_time, "months");
			$r.values["MONTHS"] = months
			today.subtract(months, "months");
			weeks = today.diff($r.stop_time, "weeks");
			$r.values["WEEKS"] = weeks
			today.subtract(weeks, "weeks");
			days = today.diff($r.stop_time, "days");
			$r.values["DAYS"] = days
			today.subtract(days, "days");
			hours = today.diff($r.stop_time, "hours");
			$r.values["HOURS"] = hours
			today.subtract(hours, "hours");
			minutes = today.diff($r.stop_time, "minutes");
			$r.values["MINUTES"] = minutes
			today.subtract(minutes, "minutes");
			seconds = today.diff($r.stop_time, "seconds");
			$r.values["SECONDS"] = seconds
			
      for(var r_key in $r.rings) $r.unit(idx++,r_key,$r.rings[r_key],$r.values[r_key]);      
      
      setTimeout($r.go,$r.update_interval);
    },
    unit: function(idx,label,ring, value) {
      // var x,y, value, ring_secs = ring.s;
      // value = parseFloat($r.time/ring_secs);
      // $r.time-=Math.round(parseInt(value)) * ring_secs;
      // value = Math.abs(value);
      
      x = ($r.r_size*.5 + $r.r_thickness*.5);
      x +=+(idx*($r.r_size+$r.r_spacing+$r.r_thickness));
      y = $r.r_size*.5;
      y += $r.r_thickness*.5;
  
      
			// calculate arc end angle
			if(value != 0){
				var degrees = 360-(value / ring.max) * 360.0;
			}else{
				var degrees = 0
			}
      
      var endAngle = degrees * (Math.PI / 180);
      
      $r.ctx.save();
  
      $r.ctx.translate(x,y);
      $r.ctx.clearRect($r.actual_size*-0.5,$r.actual_size*-0.5,$r.actual_size,$r.actual_size);
  
      // first circle
      $r.ctx.strokeStyle = "rgba(128,128,128,0.2)";
      $r.ctx.beginPath();
      $r.ctx.arc(0,0,$r.r_size/2,0,2 * Math.PI, 2);
      $r.ctx.lineWidth =$r.r_thickness;
      $r.ctx.stroke();
     
      
      
      // second circle
      $r.ctx.strokeStyle = "rgba(100, 235, 52, 0.9)";
      //$r.ctx.strokeStyle = "hsla(104, 82%, "+((value/ring.max)*35)+20+"%, 0.9)";
      $r.ctx.beginPath();
      $r.ctx.arc(0,0,$r.r_size/2,0,endAngle, 1);
      $r.ctx.lineWidth =$r.r_thickness;
      $r.ctx.stroke();
      
      // label
      $r.ctx.fillStyle = "#ffffff";
     
      $r.ctx.font = '12px Helvetica';
      $r.ctx.fillText(label, 0, 23);
      $r.ctx.fillText(label, 0, 23);   
      
      $r.ctx.font = 'bold 40px Helvetica';
      $r.ctx.fillText(Math.floor(value), 0, 10);
      
      $r.ctx.restore();
    }
  }
  
  ringer.init();