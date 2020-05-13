var rank = ['d','c','b','a','s'];
var dqw_param_preset = { 'mega1' :
                         { prob_0: 60, prob_1: 20, prob_2: 10, prob_3: 8, prob_4: 2,
                           upgr_0:  5, upgr_1:  5, upgr_2:  5, upgr_3: 5,
                         },
                         'mega2' :
                         { prob_0: 60, prob_1: 20, prob_2: 10, prob_3: 8, prob_4: 2,
                           upgr_0:  3, upgr_1:  4, upgr_2:  4, upgr_3: 5,
                         },
                         'mega3' :
                         { prob_0: 60, prob_1: 20, prob_2: 10, prob_3: 8, prob_4: 2,
                           upgr_0:  2, upgr_1:  3, upgr_2:  4, upgr_3: 5,
                         },
                         'boss1' :
                         { prob_0: 60, prob_1: 20, prob_2: 10, prob_3: 8, prob_4: 2,
                           upgr_0:  3, upgr_1:  4, upgr_2:  4, upgr_3: 4,
                         },
                         'boss2' :
                         { prob_0: 60, prob_1: 20, prob_2: 10, prob_3: 8, prob_4: 2,
                           upgr_0:  3, upgr_1:  3, upgr_2:  4, upgr_3: 5,
                         },
                         'boss3' :
                         { prob_0: 60, prob_1: 20, prob_2: 10, prob_3: 8, prob_4: 2,
                           upgr_0:  3, upgr_1:  3, upgr_2:  4, upgr_3: 4,
                         },
                         'boss4' :
                         { prob_0: 60, prob_1: 20, prob_2: 10, prob_3: 8, prob_4: 2,
                           upgr_0:  3, upgr_1:  3, upgr_2:  3, upgr_3: 3,
                         },
                         'mob1' :
                         { prob_0: 60, prob_1: 20, prob_2: 10, prob_3: 8, prob_4: 2,
                           upgr_0:  2, upgr_1:  3, upgr_2:  3, upgr_3: 4,
                         },
                       };

// プリセット
function on_change_param_preset( obj ) {
  var idx = obj.selectedIndex;
  var value = obj.options[idx].value;
  var preset = dqw_param_preset[value];
  for( let name in preset ) {
    document.getElementsByName(name).item(0).value = preset[name];
  }
  if( document.getElementsByName("upgr_4").item(0).value <= 0 )
    document.getElementsByName("upgr_4").item(0).value = 1;
  return false;
}

// 計算
function on_click_calc(obj) {
  document.getElementById("dqw_calc_status").innerHTML = "計算準備中";
  // 初期値の代入
  var param = {prob:{}, upgr:{}, hold:{} }; // 計算に必要なパラメータ
  var names = ['prob','upgr','hold'];
  for( let n of names ) {
    for( i = 0 ; i < rank.length ; i++ ) {
      param[n][i] = 0; // 初期値
      if( a = document.getElementsByName(n+'_'+i) ) {
        if( a.item(0).value ) {
          param[n][i] = a.item(0).value * 1;
        }
      }
      document.getElementsByName(n+'_'+i).item(0).value = param[n][i]; // 書き戻し
    }
  }
  // need (必要数)とholdの計算
  var hold = 0;
  param['need'] = {};
  for( var i=0 ; i < rank.length ; i++ ) {
    if( i == 0 ) {
      param['need'][i] = 1;
      hold = param['hold'][i];
    }else{
      param['need'][i] = param['need'][i-1] * param['upgr'][i-1];
      hold += param['hold'][i] * param['need'][i];
    }
  }
  console.log("hold="+hold+" param is"); 
  console.log(param); 
  var res = []; // 計算結果
  var goal = param['need'][rank.length-1] * param['upgr'][rank.length-1];
  for( i=0 ; i<=goal-hold ; i++ ) {
    res[i] = 0;
  }
  document.getElementById("dqw_calc_status").innerHTML = "計算中";
  res = r_calc(param,0,hold,goal,res);
  document.getElementById("dqw_calc_status").innerHTML = "計算終了";
  // console.log(res);
  console.log("res.length="+(res.length));
  

  // 結果の表示
  var min = Math.ceil((goal-hold)/param['need'][rank.length-1]);
  if( min <= 0 ) {
    document.getElementById("dqw_calc_status").innerHTML = "達成済み";
    for( i=0 ; i<7 ; i++ ) {
      document.getElementById("res_"+i).innerHTML = '-';
    }
  }else{
    document.getElementById("res_0").innerHTML = min;
    document.getElementById("res_6").innerHTML = goal-hold;
    var pc = [ 5, 25, 50, 75, 95 ];
    var sum = 0;
    var i = 0;
    for( n=0 ; n<res.length ; n++ ) {
      sum += 100*res[n];
      if( pc[i] < sum ) {
        i++;
        document.getElementById("res_"+i).innerHTML = n;
        if( pc.length <= i ) break;
      }
    }
  }
  return false;
}

// 乱数法計算
function r_calc(param,num,hold,goal,res) {
  // 試行回数
  var N = 10000;
  for( j = 0 ; j < N ; j++ ) {
    // 終了条件
    var n = num;
    var h = hold;

    while( h < goal ) {
      // 場合分け
      var rand = Math.random()*100;
      for( var i=0 ; i<rank.length ; i++ ) {
        if( rand <= param['prob'][i] ) { // i が選ばれた
          // res = r_calc(param,num+1,hold+param['need'][i],goal,res);
          n ++;
          h += param['need'][i];
          break;
        }else{
          rand -= param['prob'][i];
        }
      }
    }

    // 到達
    res[n] += 1.0/N;
    // console.log("reach j="+j+" goal("+goal+") h="+h+" n="+n);
  }
  return res;
}

// 全数再帰計算
function a_calc(param,prob,num,hold,goal,res) {
  // 終了条件
  if( goal <= hold ) {
    res[num] += prob;
    console.log("reach goal("+goal+") hold="+hold+" num="+num+" prob="+prob+" total prob="+res[num]);
    return res;
  }
  
  // 場合分け
  for( var i=0 ; i<rank.length ; i++ ) {
    res = a_calc(param,prob*0.01*param['prob'][i],num+1,hold+param['need'][i],goal,res);
  }
  // ログ
  //console.log("num="+num+" prob="+prob+" hold="+hold+" goal="+goal+" param is");
  //console.log(param);
  return res;
}
