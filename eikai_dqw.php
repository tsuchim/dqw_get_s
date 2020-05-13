<?php
/*
Plugin Name: DQW plugin for Eikai
Plugin URI: https://eikai.co.jp/
Description: ドラクエウォーク用のツール
Version: 0.0.1
Author: Yuji Tsuchimoto <yuji@eikai.co.jp>
Author URI: http://eikai.co.jp/tsuchim/
License: Closed
 */

class EIKAI_DQW {
  // 定数
  const DATADIR = '/var/www/eikai-wp/include/carp'; // Data Directory
  // データ
  private $prop_rank = array(); // 順位確率

  // 初期化
  public function __construct(){
    add_action('init', array($this,'register_eikai_dqw_shortcodes')); //shortcodes
  }
  // データの読込
  private function load_data() {
    for( $i = 0 ; $i < 2 ; $i++ ) {
      $filename = sprintf('%s/r_%d.out.dat', self::DATADIR, $i);
      $lines = preg_split('/[\n\r]+/',file_get_contents($filename));
      $this->prop_rank[$i] = array();
      foreach( $lines as $line ) {
        $this->prop_rank[$i][] = preg_split('/\t+/',$line);
      }
    }
  }

  // セルの色のクラス分け
  public static function getClassByPercent( $p ) {
    $c = '';
    if(      $p ==  0.0 ) { $c = 'r01'; }
    else if( $p <   1.0 ) { $c = 'r05'; }
    else if( $p <   5.0 ) { $c = 'r20'; }
    else if( $p ==100.0 ) { $c = 'r99'; }
    else if( $p >= 99.0 ) { $c = 'r95'; }
    else if( $p >= 95.0 ) { $c = 'r80'; }
    else if( $p >= 90.0 ) { $c = 'r70'; }
    else if( $p >= 75.0 ) { $c = 'r60'; }
    return $c;
  }

  // ショートコード
  //location shortcode
  public function register_eikai_dqw_shortcodes(){
    add_shortcode('eikai_dqw_kokoro_simulator', array($this,'eikai_dqw_kokoro_simulator_shortcode_output'));
  }
  // ファイルを読み込む
  public function eikai_dqw_include_shortcode_output($atts, $content = '', $tag){
    extract( shortcode_atts( array(
      'file' => '', 
      ), $atts ) );
    $html = file_get_contents( self::DATADIR . '/' . $file );
    if( $content ) {
      return sprintf($content,$html);
    }else{
      return $html;
    }
  }

  // HTMLを生成
  public function eikai_dqw_kokoro_simulator_shortcode_output($atts, $content = '', $tag){
    $ranks = array( 4=>'S', 3=>'A', 2=>'B', 1=>'C', 0=>'D' );

    print <<<EOT
<link rel="stylesheet" href="/wp-content/plugins/eikai_dqw/style.css" type="text/css" media="screen">
<script src="/wp-content/plugins/eikai_dqw/sim.js" defer></script>
<form name="dqw_kokoro_simulator" id="dqw_kokoro_simulator">
プリセット :
<select name="param_preset" onChange="return on_change_param_preset(this);">
 <option value="-">-</option>
 <option value="mega1">メガモンスター1 (りゅうおう・トロル)</option>
 <option value="mega2">メガモンスター2 (バラモス・ゾーマ)</option>
 <option value="mega3">メガモンスター3 (究極エビルプリースト)</option>
 <option value="boss1">強敵1 (おひなさまスライム)</option>
 <option value="boss2">強敵2 (やまたのおろち)</option>
 <option value="boss3">強敵3 (アンドレアル)</option>
 <option value="boss4">強敵4 (ヘルバトラー)</option>
 <option value="mob1">通常1 (よくみかける)</option>
</select>
<hr>
<table>
 <thead>
  <tr>
   <th>ランク</th>
   <th>出現率(%)</th>
   <th>必要数</th>
   <th>所持数</th>
  </tr>
 </thead>
 <tbody>
EOT;
    $idn = 0;
    foreach( $ranks as $rank => $name ) {
      $idx++;
      print <<<EOT
  <tr>
   <td>$name</td>
   <td id="id_prob_$rank"><input type="text" name="prob_$rank" tabindex="3$idx"></td>
   <td id="id_upgr_$rank"><input type="text" name="upgr_$rank" tabindex="2$idx"></td>
   <td id="id_hold_$rank"><input type="text" name="hold_$rank" tabindex="1$idx"></td>
  </tr>
EOT;
    }
    print <<<EOT
 </tbody>
</table>
<hr>
<button type="button" name="calc" onClick="on_click_calc(this);return false;">計算</button>
<span id="dqw_calc_status"></span>
</form>
<hr>
<table id="dqw_kokoro_result">
 <thead>
  <tr><th>引きの強さ</th><th>ドロップ回数</th></tr>
 </thead>
 <tbody>
  <tr><td>最強</td><td><span id="res_0">-</span></td></tr>
  <tr><td>ぶち良い</td><td><span id="res_1">-</span></td></tr>
  <tr><td>やや良い</td><td><span id="res_2">-</span></td></tr>
  <tr><td>普通</td><td><span id="res_3">-</span></td></tr>
  <tr><td>やや悪い</td><td><span id="res_4">-</span></td></tr>
  <tr><td>ぶち悪い</td><td><span id="res_5">-</span></td></tr>
  <tr><td>最悪</td><td><span id="res_6">-</span></td></tr>
 </tbody>
</table>
<hr>
<div class="google-auto-placed">
 <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-0079258379127507"
      data-ad-slot="6262078606"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
 <script>
  (adsbygoogle = window.adsbygoogle || []).push({});
 </script>
</div>
<hr>
EOT;
  }
};

// インスタンスを生成
$eikai_dqw = new EIKAI_DQW;
?>
