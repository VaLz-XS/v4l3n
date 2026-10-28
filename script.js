// === NAVIGASI & MENU ===
(function(){
  var views=[].slice.call(document.querySelectorAll("[data-view]"));
  var links=[].slice.call(document.querySelectorAll(".menu a"));
  var menu=document.getElementById("menu"),mb=document.getElementById("mb");
  function setMenu(open){menu.hidden=!open;mb.setAttribute("aria-expanded",open?"true":"false");mb.setAttribute("aria-label",open?"Tutup menu":"Buka menu")}
  function show(name){
    if(!views.some(function(v){return v.dataset.view===name}))name="beranda";
    views.forEach(function(v){v.hidden=v.dataset.view!==name});
    links.forEach(function(a){if(a.getAttribute("href")==="#"+name)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
    setMenu(false);window.scrollTo(0,0);
  }
  mb.addEventListener("click",function(e){e.stopPropagation();setMenu(menu.hidden)});
  links.forEach(function(a){a.addEventListener("click",function(e){
    e.preventDefault();var n=a.getAttribute("href").slice(1);show(n);
    try{location.hash=n}catch(err){}
  })});
  document.addEventListener("click",function(e){if(!menu.hidden&&!menu.contains(e.target))setMenu(false)});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!menu.hidden){setMenu(false);mb.focus()}});
  window.addEventListener("hashchange",function(){show(location.hash.slice(1))});
  show(location.hash.slice(1));
})();

// === MASKOT TENKA ===
(function(){
  var el=document.getElementById("tenka"),bub=document.getElementById("say");
  var sx,sy,ox,oy,down=false,moved=false,timer;
  function say(t,ms){
    var r=el.getBoundingClientRect();
    bub.textContent=t;
    bub.className="say "+(r.left+r.width/2<innerWidth/2?"l":"r")+(r.top<80?" below":"");
    bub.hidden=false;clearTimeout(timer);timer=setTimeout(function(){bub.hidden=true},ms||2400);
  }
  var snd=new Audio("nani.mp3");snd.preload="auto";
  var AC=window.AudioContext||window.webkitAudioContext,ctx=null,buf=null,node=null;
  try{
    if(AC){
      ctx=new AC();
      fetch("meow.mp3").then(function(r){return r.arrayBuffer()})
        .then(function(ab){return ctx.decodeAudioData(ab)})
        .then(function(b){buf=b}).catch(function(){});
    }
  }catch(e){ctx=null}
  function startMv(){
    try{if(ctx&&buf&&!node){node=ctx.createBufferSource();node.buffer=buf;node.loop=true;node.connect(ctx.destination);node.start(0)}}catch(e){}
  }
  function stopMv(){try{if(node){node.stop();node=null}}catch(e){}}
  function fallback(){
    try{
      var s=window.speechSynthesis;if(!s)return;
      s.cancel();
      var u=new SpeechSynthesisUtterance("\u306a\u306b\uff1f");u.lang="ja-JP";u.pitch=1.4;
      var v=s.getVoices().filter(function(x){return /^ja/i.test(x.lang)})[0];if(v)u.voice=v;
      s.speak(u);
    }catch(e){}
  }
  function speak(){
    try{snd.currentTime=0;var p=snd.play();if(p&&p.catch)p.catch(fallback)}catch(e){fallback()}
  }
  function tap(){say("Hah? Apa sih?");speak()}
  function place(x,y){
    var w=el.offsetWidth,h=el.offsetHeight;
    el.style.left=Math.max(4,Math.min(innerWidth-w-4,x))+"px";
    el.style.top=Math.max(4,Math.min(innerHeight-h-4,y))+"px";
  }
  el.addEventListener("pointerdown",function(e){
    var r=el.getBoundingClientRect();
    down=true;moved=false;sx=e.clientX;sy=e.clientY;ox=r.left;oy=r.top;
    try{el.setPointerCapture(e.pointerId)}catch(err){}
    try{if(ctx&&ctx.state==="suspended")ctx.resume()}catch(err){}
  });
  el.addEventListener("pointermove",function(e){
    if(!down)return;
    var dx=e.clientX-sx,dy=e.clientY-sy;
    if(!moved){
      if(Math.hypot(dx,dy)<6)return;
      moved=true;el.classList.add("drag");el.style.right="auto";el.style.bottom="auto";
      place(ox,oy);say("Eh, aku digeser!",1500);startMv();
    }
    place(ox+dx,oy+dy);
  });
  function end(){
    if(!down)return;
    down=false;el.classList.remove("drag");stopMv();
    if(!moved)tap();
  }
  el.addEventListener("pointerup",end);
  el.addEventListener("pointercancel",function(){down=false;el.classList.remove("drag");stopMv()});
  el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();tap()}});
  window.addEventListener("resize",function(){if(el.style.left)place(parseFloat(el.style.left),parseFloat(el.style.top))});
  document.addEventListener("masuk",function(){setTimeout(function(){say("Halo, aku Tenka!",2600)},300)});
})();

// === LOADING SCREEN ===
(function(){
  var ld=document.getElementById("load"),trk=document.getElementById("trk"),
      pct=document.getElementById("pct"),tx=document.getElementById("ldt"),
      btn=document.getElementById("masukBtn"),sfx=document.getElementById("valenSfx");
  var N=20,blocks=[],i;
  for(i=0;i<N;i++){var b=document.createElement("i");trk.appendChild(b);blocks.push(b)}
  var msgs=["Memuat tampilan…","Menyiapkan bot…","Memanggil Tenka…","Siap."];
  var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
  var total=reduce?600:1500,start=Date.now(),done=false;

  function finish(){
    if(done)return;done=true;
    ld.classList.add("out");
    setTimeout(function(){ld.hidden=true;document.dispatchEvent(new Event("masuk"))},reduce?0:350);
  }

  var tick=setInterval(function(){
    var p=Math.min(1,(Date.now()-start)/total);
    var n=Math.round(p*N);
    for(var k=0;k<N;k++)blocks[k].className=k<n?"on":"";
    pct.textContent=Math.round(p*100)+"%";
    tx.textContent=msgs[Math.min(msgs.length-1,Math.floor(p*msgs.length))];
    if(p>=1){
      clearInterval(tick);
      tx.textContent="Selamat datang di VaLen.";
      btn.hidden=false;
    }
  },60);

  btn.addEventListener("click",function(){
    btn.disabled=true;
    btn.textContent="Membuka beranda…";
    if(sfx){
      try{
        sfx.currentTime=0;
        sfx.loop=false;
        var p=sfx.play();
        if(p&&p.catch)p.catch(function(){});
      }catch(e){}
    }
    setTimeout(finish, reduce?0:600);
  });
})();

// === LOGIN & PROFIL ===
(function(){
  var profileBar = document.getElementById('profileBar');
  var userName = document.getElementById('userName');
  var userAvatar = document.getElementById('userAvatar');
  var logoutBtn = document.getElementById('logoutBtn');
  var loginModal = document.getElementById('loginModal');
  var inputName = document.getElementById('inputName');
  var inputFile = document.getElementById('inputFile');
  var btnLogin = document.getElementById('btnLogin');

  function checkProfile() {
    var savedName = localStorage.getItem('valen_name');
    var savedPic = localStorage.getItem('valen_pic');

    if (savedName) {
      profileBar.hidden = false;
      userName.textContent = savedName;
      if (savedPic) userAvatar.src = savedPic;
      loginModal.hidden = true;
    } else {
      profileBar.hidden = true;
      loginModal.hidden = false;
    }
  }

  if(btnLogin){
    btnLogin.addEventListener('click', function(){
      var name = inputName.value.trim();
      if (!name) return alert('Nama jangan kosong bang!');
      
      localStorage.setItem('valen_name', name);

      var file = inputFile.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
          localStorage.setItem('valen_pic', e.target.result);
          checkProfile();
        };
        reader.readAsDataURL(file);
      } else {
        checkProfile();
      }
    });
  }

  if(logoutBtn){
    logoutBtn.addEventListener('click', function(){
      localStorage.removeItem('valen_name');
      localStorage.removeItem('valen_pic');
      userAvatar.src = 'logo.png';
      checkProfile();
    });
  }

  checkProfile();
})();

// === MUSIK, WAKE LOCK, & DINO ===
(function(){
  var libraryView = document.getElementById("libraryView");
  var playerView = document.getElementById("playerView");
  var searchBox = document.getElementById("searchBox");
  var songGrid = document.getElementById("songGrid");
  var backBtn = document.getElementById("backBtn");
  var audio = document.getElementById("lagu");
  var playBtn = document.getElementById("playBtn");
  var seek = document.getElementById("seek");
  var tCur = document.getElementById("tCur");
  var tDur = document.getElementById("tDur");
  var box = document.getElementById("lyricsBox");
  var inner = document.getElementById("lyricsInner");
  var nowPlayingTitle = document.getElementById("nowPlayingTitle");
  var nowPlayingArtist = document.getElementById("nowPlayingArtist");
  var playerTitle = document.getElementById("playerTitle");
  var keepAwakeBtn = document.getElementById("keepAwakeBtn");

  var SONGS_DATA = {
    "Bye": [
      [11.12, "Bye-bye"], [12.83, "Yeah, boy, bye"], [14.68, "It's over, it's over, oh, yeah"], [17.53, "This ain't the first time I've been hostage to these tears"], [21.60, "I can't believe I'm finally movin' through my fears"], [26.12, "At least I know how hard we tried, both you and me"], [30.43, "Didn't we? Didn't we?"], [33.99, "So I grab my stuff"], [36.17, "Courtney just pulled up in the driveway"], [41.15, "It's time"], [44.09, "Bye-bye"], [46.23, "Boy, bye"], [48.57, "Bye-bye"], [49.86, "It's over, it's over, oh, yeah"], [52.75, "Bye-bye"], [54.03, "I'm taking what's mine, yeah"], [57.15, "Bye-bye"], [58.54, "It's over, it's over, oh, yeah"], [61.30, "You know, I'm stronger than I think"], [65.57, "Usually, I'd join you on the floor, but this dance ain't for me"], [69.97, "Boy, just turn the music up"], [71.91, "Maybe someday, we'll look back with love"], [74.39, "Didn't think you'd lose me"], [76.25, "Now it's just too late to choose me"], [78.02, "So I grab my stuff"], [79.73, "Courtney just pulled up in the driveway"], [84.01, "It's time (it's time)"], [87.77, "Bye-bye"], [89.79, "Boy, bye"], [92.19, "Bye-bye"], [93.39, "It's over, it's over, oh, yeah"], [96.12, "Bye-bye"], [97.73, "I'm taking what's mine, yeah (taking what's mine)"], [100.78, "Bye-bye"], [101.95, "It's over, it's over, oh, yeah"], [105.94, "Now, it's certainly bittersweet"], [110.50, "This hook feels too hard to sing"], [115.89, "But it's better than repeat"], [122.42, "Bye-bye"], [124.78, "Boy, bye"], [126.95, "Bye-bye"], [128.32, "It's over, it's over, oh, yeah"], [131.61, "Bye-bye"], [132.62, "I'm taking what's mine, yeah"], [135.59, "Bye-bye"], [137.07, "It's over, it's over, oh, yeah"], [139.96, "Bye-bye"], [142.04, "Boy, bye"], [144.31, "Bye-bye"], [145.75, "It's over, it's over, oh, yeah"], [148.80, "Bye-bye"], [150.18, "I'm taking what's mine, yeah (taking what's mine)"], [152.97, "Bye-bye"], [154.38, "It's over, it's over, oh, yeah"]
    ],
    "1000X": [
      [23.49, "Kadang aku iri melihat mereka"], [28.24, "Tercipta seperti pasangan yang sempurna"], [33.00, "Saling mencintai dan begitu bahagia"], [37.47, "Dan dipuja puji insan yang memandangnya"], [42.28, "Lalu aku memandangmu"], [46.78, "Dan tersadar betapa beruntungnya"], [51.20, "Ada cinta seperti cintamu kepadaku"], [58.53, "Hooo"], [59.87, "Cukup aku milikmu dan kamu milikku"], [64.76, "Tetap disampingku sampai jadi debu"], [69.36, "Sampai akhir waktu"], [71.82, "Sampai maut yang bersaksi cintaku abadi"], [77.94, "Dan bila aku terlahir 1000X lagi"], [82.92, "Di dunia yang lain aku tak peduli"], [87.57, "Kau akan kucari"], [90.11, "Sampai kau tau betapa kau kucintai"], [97.05, "Lalu aku memandangmu"], [101.68, "Dan tersadar betapa beruntungnya"], [106.13, "Ada cinta seperti cintamu kepadaku"], [113.29, "Hooo"], [114.65, "Cukup aku milikmu dan kamu milikku"], [119.66, "Tetap disampingku sampai jadi debu"], [124.11, "Sampai akhir waktu"], [126.78, "Sampai maut yang bersaksi cintaku abadi"], [132.77, "Dan bila aku terlahir 1000X lagi"], [138.00, "Di dunia yang lain, aku tak peduli"], [142.42, "Kau akan kucari"], [145.00, "Sampai kau tau betapa kau kucintai"], [151.23, "Sampai sampai maut maut"], [153.69, "Sampai maut yang bersaksi"], [155.86, "Sampai sampai seribu seribu"], [158.13, "Kali lagi"], [159.03, "1000X lagi"], [160.55, "(Kau akan kucari)"], [163.00, "Kau kan ku cintai"], [165.31, "(Kau kan kucintai)"], [169.54, "Cukup aku milikmu kau milikku"], [174.50, "(Tetap disampingku)"], [176.74, "Sampai jadi debu"], [179.02, "Sampai akhir waktu"], [181.77, "Hooo"], [186.01, "Kau tetap milikku"], [188.03, "(Cukup aku milikmu dan kamu milikku)"], [190.72, "Bintang di malamku"], [192.93, "(Tetap disampingku sampai jadi debu)"], [195.61, "Detak di jantungku"], [197.74, "(Sampai akhir waktu)"], [199.98, "(Sampai maut yang bersaksi cintaku abadi)"], [202.60, "Cintaku abadi"], [206.18, "(Dan bila aku terlahir 1000X lagi)"], [209.18, "1000X lagi"], [210.95, "(Di dunia yang lain aku tak peduli)"], [214.04, "Aku tak peduli"], [215.69, "(Kau akan kucari)"], [218.14, "Sampai kau tahu berapa kau kucintai"]
    ],
    "Merry Christmas, Please Don't Call": [
      [5.10, "To the tempo of your uptight"], [7.37, "Is the flicker of a street light"], [10.48, "You know this moment, don't ya"], [13.70, "And time is strangely calm now"], [16.18, "'Cause everybody's gone it's"], [19.41, "Just you and your anger"], [22.07, "Oh, golden boy, don't act like you were kind"], [27.66, "You were mine but you were awful every time"], [30.78, "So don't tell them what you told me"], [32.88, "Don't hold me like you know me"], [35.99, "I would rather burn forever"], [39.45, "But you should know that I died slow"], [43.78, "Running through the halls of your haunted home"], [47.93, "And the toughest part is that we both know"], [52.11, "What happened to you"], [54.23, "Why you're out on your own"], [57.22, "Merry Christmas, please don't call"], [65.05, "You really left me on the line, kid"], [67.65, "Holding all your baggage"], [70.49, "You know I'm not your father"], [73.53, "Who says welcome to your uptight"], [75.84, "While it flickers like a street light"], [78.98, "He flickers through your damage"], [82.17, "Oh, golden boy, you shined a light on your home"], [87.35, "And at your best you were magic, I was sold"], [90.69, "But don't tell 'em what you told me"], [92.98, "Don't even tell 'em that you know me"], [95.96, "I would rather burn forever"], [99.58, "But you should know that I died slow"], [103.88, "Running through the halls of your haunted home"], [108.00, "And the toughest part is that we both know"], [112.01, "What happened to you"], [114.06, "Why you're out on your own"], [117.14, "Merry Christmas"], [118.97, "Please don't call"], [124.73, "One ticket out of your heavy gaze"], [128.58, "I want one ticket off of your carousel"], [132.59, "I want one ticket out of your heavy gaze"], [136.76, "I want one ticket off of your carousel"], [142.26, "But you should know that I died slow"], [146.87, "Running through the halls of your haunted home"], [151.03, "And the toughest part is that we both know"], [154.96, "What happened to you"], [156.93, "Why you're out on your own"], [159.89, "Merry Christmas"], [161.85, "Please don't call"], [164.33, "Merry Christmas"], [165.73, "I'm not yours at all"], [168.35, "Merry Christmas"]
    ],
    "I'll Do It": [
      [12.10, "I'll be your blonde tonight if that's what you like"],
      [16.70, "Stilettos and fishnets, if that's what you like"],
      [20.41, "I'll be your hot nurse, school girl in curls"],
      [25.42, "Whatever your type, baby, if that's what you like, I'll do it"],
      [30.73, "Pick me, take me, off up into your dungeon"],
      [34.89, "I brought some treats, I know that you gon' love 'em"],
      [39.08, "Come eat my panties off me, do whatever you feel comes naturally"],
      [46.67, "'Cause I wanna let my hair down, is that alright?"],
      [52.35, "Is that okay? Ay-ay"],
      [54.90, "'Cause I wanna let my hair down, is that alright?"],
      [60.93, "Is that okay? Ay-ay"],
      [63.04, "I'll be your blonde tonight if that's what you like"],
      [67.77, "Stilettos and fishnets, if that's what you like"],
      [71.59, "I'll be your hot nurse, school girl in curls"],
      [76.29, "Whatever your type, baby, if that's what you like, I'll do it"],
      [82.10, "I'll do it (do it)"],
      [84.29, "I'll do it, I-I-I-I-I-I-I I'll do it"],
      [87.46, "I-I-I, bitch, I'll do this"],
      [89.94, "I hope you're ready for what I'm 'bout to do"],
      [94.39, "Just close your eyes, open up when I tell you"],
      [98.69, "Look now, don't touch, I'm gonna start without you"],
      [102.13, "Rev me up, just put the key in my ignition, baby"],
      [106.00, "'Cause I wanna let my hair down, is that alright?"],
      [111.76, "Is that okay? Ay-ay"],
      [114.49, "'Cause I wanna let my hair down, is that alright?"],
      [120.27, "Is that okay? Ay-ay"],
      [122.39, "I'll be your blonde tonight if that's what you like"],
      [127.14, "Stilettos and fishnets, if that's what you like"],
      [130.80, "I'll be your hot nurse, school girl in curls"],
      [135.61, "Whatever your type, baby, if that's what you like, I'll do it"],
      [141.69, "I'll do it (do it)"],
      [143.51, "I'll do it, I-I-I-I-I I'll do it"],
      [146.72, "I-I-I-I-I, bitch, I'll do this"],
      [149.00, "I can be your type, you can believe the hype"],
      [153.23, "Just push my buttons, baby, I'll go low, and you'll go high"],
      [157.45, "You can be my pilot, and we mile high it"],
      [161.80, "I'll just sit up and make it happen, then you better fly it"],
      [165.12, "I'll be your blonde tonight if that's what you like"],
      [169.72, "Stilettos and fishnets, if that's what you like"],
      [173.45, "I'll be your hot nurse, school girl in curls"],
      [178.22, "Whatever your type, baby, if that's what you like"],
      [181.96, "I'll be your blonde tonight if that's what you like"],
      [186.70, "Stilettos and fishnets, if that's what you like"],
      [190.49, "I'll be your hot nurse, school girl in curls"],
      [195.15, "Whatever your type, baby, if that's what you like, I'll do it"],
      [200.98, "I'll do it (I'll do it)"],
      [203.29, "I'll do it, I-I-I-I-I I'll do it"],
      [206.05, "I-I-I-I-I bitch, I'll do this"]
    ],
    "Bersenja Gurau": [
      [11.73, "Banyak yang salah mengira"],
      [17.85, "Senja bukan tentang kopi, lagu indie, dan cerita"],
      [24.04, "Ku kasih tahu kepadamu"],
      [30.48, "Senja adalah hadiah pejalan kaki menjemput magribnya"],
      [39.73, "Selalu ada pelangi"],
      [48.32, "Pada setiap mendungnya"],
      [52.84, "Setiap derita"],
      [55.00, "Ku 'kan ada selalu untukmu"],
      [63.98, "Temani setiap derita"],
      [68.27, "Jadi pelukan ternyaman untukmu"],
      [80.32, "Jika sempit hidup ini"],
      [83.33, "(Jika sempit hidup ini)"],
      [86.62, "Tidur selalu tak tenang, pagi selalu menyiksa"],
      [92.51, "Semua akan baik saja"],
      [98.99, "Sebab Tuhan telah berjanji, setelah sempit ada kemudahan"],
      [108.41, "Kita milik-Nya"],
      [114.53, "Semua telah tertulis"],
      [118.27, "Dan akan kembali pada-Nya"],
      [133.05, "Selalu ada pelangi"],
      [141.82, "Pada setiap mendungnya"],
      [146.22, "Setiap derita"],
      [148.68, "Selalu ada pelangi"],
      [157.49, "Pada setiap mendungnya"],
      [161.80, "Setiap derita"],
      [164.13, "Ku 'kan ada selalu untukmu"],
      [172.96, "Temani setiap derita"],
      [177.26, "Jadi pelukan ternyaman untukmu"]
    ],
    "Chandelier": [
      [1.02, "Party girls don't get hurt"], [3.13, "Can't feel anything, when will I learn?"], [5.99, "I push it down, I push it down"], [12.18, "I'm the one for a good time call"], [14.27, "Phone's blowin' up, ringin' my doorbell"], [17.06, "I feel the love, I feel the love"], [22.80, "One, two, three, one, two, three, drink"], [25.53, "One, two, three, one, two, three, drink"], [28.34, "One, two, three, one, two, three, drink"], [31.16, "Throw 'em back 'til I lose count"],
      [33.89, "I'm gonna swing from the chandelier", "glitch-red"], [41.68, "From the chandelier", "glitch-red"], [44.80, "I'm gonna live like tomorrow doesn't exist", "glitch-red"], [52.79, "Like it doesn't exist", "glitch-red"], [55.86, "I'm gonna fly like a bird through the night", "glitch-red"], [63.74, "Feel my tears as they dry", "glitch-red"], [66.89, "I'm gonna swing from the chandelier", "glitch-red"], [74.79, "From the chandelier", "glitch-red"],
      [77.23, "But I'm holding on for dear life"], [79.50, "Won't look down, won't open my eyes"], [82.36, "Keep my glass full until morning light"], [85.19, "'Cause I'm just holding on for tonight"], [87.77, "Help me, I'm holding on for dear life"], [90.59, "Won't look down, won't open my eyes"], [93.34, "Keep my glass full until morning light"], [96.00, "'Cause I'm just holding on for tonight"], [98.61, "On for tonight"], [100.29, "Sun is up, I'm a mess"], [102.51, "Gotta get out now, gotta run from this"], [105.22, "Here comes the shame, here comes the shame (ah)"], [111.00, "One, two, three, one, two, three, drink"], [113.83, "One, two, three, one, two, three, drink"], [116.55, "One, two, three, one, two, three, drink"], [119.30, "Throw 'em back 'til I lose count"],
      [122.02, "I'm gonna swing from the chandelier", "glitch-red"], [130.02, "From the chandelier", "glitch-red"], [133.15, "I'm gonna live like tomorrow doesn't exist", "glitch-red"], [140.92, "Like it doesn't exist", "glitch-red"], [144.16, "I'm gonna fly like a bird through the night", "glitch-red"], [151.90, "Feel my tears as they dry", "glitch-red"], [155.19, "I'm gonna swing from the chandelier", "glitch-red"], [163.05, "From the chandelier", "glitch-red"],
      [165.48, "But I'm holding on for dear life"], [167.99, "Won't look down, won't open my eyes"], [170.65, "Keep my glass full until morning light"], [173.24, "'Cause I'm just holding on for tonight"], [176.14, "Help me, I'm holding on for dear life"], [178.84, "Won't look down, won't open my eyes"], [181.54, "Keep my glass full until morning light"], [184.48, "'Cause I'm just holding on for tonight"], [186.94, "On for tonight, on for tonight"], [189.91, "'Cause I'm just holding on for tonight"], [192.67, "Oh, I'm just holding on for tonight"], [195.22, "On for tonight, on for tonight"], [198.12, "'Cause I'm just holding on for tonight"], [200.94, "'Cause I'm just holding on for tonight"], [203.76, "Oh, I'm just holding on for tonight"], [206.27, "On for tonight, on for tonight"]
    ],
    "Great Expectation": [
      [13.39, "In my head, you lay down next to me"], [16.55, "Kiss my lips, hold me carefully"], [19.62, "Say goodbye and feel all the withdrawals"], [25.92, "But it's not the same in reality"], [29.24, "I say your name, but you don't get back to me"], [32.68, "'Til you got something you need me for"], [37.34, "So I sing just to know I'm alive"], [41.68, "And I cried all the tears I could cry"], [45.24, "If happiness is just an illusion"], [48.04, "You were the best I ever had"], [51.69, "If you can't be what I want"], [54.69, "And the things you say aren't true"], [58.15, "All I need is the great expectation of you"], [64.05, "Expectation of you"], [67.51, "The tracks of my tears go back for years"], [70.84, "When I was young, I've always had the fears"], [74.26, "One would leave, so I held on so long"], [80.25, "But to each their own, you come and go a lot"], [83.65, "It's black and white, but I go back and change the plot"], [87.20, "Just to have you in the way I want, so I"], [93.36, "Sing just to know I'm alive (I sing, so I)"], [96.10, "And I cried all the tears I could cry (I cried for you)"], [99.59, "If happiness is just an illusion"], [102.46, "You were the best I ever had"], [105.98, "If you can't be what I want (be what I want)"], [109.07, "And the things you say aren't true (aren't true, yeah, true)"], [112.52, "All I need is the great expectation of you, oh"], [118.82, "Cry my tears and let 'em dry (mm, expectation of you)"], [122.27, "Cry my tears and testify"], [125.46, "You exist inside my mind"], [128.64, "You, so"],
      [130.17, "So I sing just to know I'm alive", "glitch-red"], [134.61, "And I cried all the tears I could cry (I cried for you)", "glitch-red"], [138.16, "If happiness is just an illusion", "glitch-red"], [140.88, "You were the best I ever had (best I had)", "glitch-red"], [144.46, "If you can't be what I want (be what I want)", "glitch-red"], [147.25, "And the things you say aren't true (aren't true, yeah, true)", "glitch-red"], [150.93, "All I need is the great expectation of you", "glitch-red"], [157.74, "All I need is", "glitch-red"], [161.41, "All I need is you", "glitch-red"]
    ],
    "Everything U Are": [
      [12.06, "Wajahmu kuingat selalu"],
      [19.06, "Lupakan hal-hal yang menggangguku"],
      [25.75, "Kar'na hari ini mata kita beradu"],
      [31.71, "Kita saling bantu"],
      [35.18, "Melepas perasaan"],
      [38.02, "Tinggi ke angkasa"],
      [41.19, "Menantang dunia"],
      [44.23, "Merayakan muda"],
      [47.32, "'Tuk satu jam saja"],
      [49.27, "Kita hampir mati"],
      [51.69, "Dan kauselamatkan aku"],
      [54.70, "Dan ku menyelamatkanmu"],
      [57.81, "Dan sekarang aku tahu"],
      [61.12, "Cerita kita tak jauh berbeda"],
      [68.52, "Got beat down by the world"],
      [71.91, "Sometimes I wanna fold"],
      [73.89, "Namun, suratmu 'kan kuceritakan"],
      [76.56, "Ke anak-anakku nanti"],
      [79.36, "Bahwa aku pernah dicintai"],
      [84.24, "With everything you are"],
      [90.31, "Fully as I am"],
      [93.47, "With everything you are"],
      [98.01, "Wajahmu yang beragam rupa"],
      [105.02, "Pastikan ku tak sendirian"],
      [111.64, "Jalani derita"],
      [114.94, "Kaubawakan kisahmu, aku mendengarkan"],
      [121.01, "Oh, kita bergantian"],
      [124.15, "Bertukar nestapa"],
      [127.18, "Menawar trauma"],
      [130.33, "Datang seadanya"],
      [133.26, "Terasku terbuka"],
      [135.45, "Kita hampir mati"],
      [137.89, "Dan kauselamatkan aku"],
      [141.02, "Dan ku menyelamatkanmu"],
      [144.06, "Dan sekarang aku tahu"],
      [147.18, "Cerita kita tak jauh berbeda"],
      [154.96, "Got beat down by the world"],
      [158.06, "Sometimes I wanna fold"],
      [160.00, "Namun, suratmu 'kan kuceritakan"],
      [162.68, "Ke anak-anakku nanti"],
      [165.43, "Bahwa aku pernah dicintai"],
      [170.10, "Seada-adanya"],
      [173.57, "Sekurang-kurangnya"],
      [176.55, "Walau sulit utarakan hatiku dengan indah"],
      [182.62, "Walau jarang ku bernyanyi"],
      [185.60, "Dengan cara yang indah"],
      [188.75, "Tapi tak sekali pun kisahku"],
      [192.51, "Pernah kaubantah, ho"],
      [196.77, "Cerita kita tak jauh berbeda"],
      [204.01, "Got beat down by the world (got beat down by the world)"],
      [207.26, "Sometimes I wanna fold"],
      [209.28, "Namun, suratmu 'kan kuceritakan"],
      [211.89, "Ke anak-anakku nanti"],
      [214.87, "Bahwa aku pernah dicintai"],
      [219.40, "With everything you are"],
      [225.63, "Fully as I am"],
      [228.51, "With everything you are"]
    ],
    "The Cure": [
      [13.89, "All the pretty girls in the foreground of my mind"],
      [20.24, "I thought I'd done enough, but they keep moving the line"],
      [26.10, "I thought I found the antidote this time"],
      [32.91, "I thought I found the antidote this time"],
      [40.69, "All the nights I spend fighting bad thoughts in my room"],
      [47.21, "Feeling so alone, might as well be on the moon"],
      [52.82, "I thought I found the antidote with you"],
      [59.60, "I thought I found the antidote with you"],
      [66.23, "But my head is full of poison"],
      [69.75, "And my heart is full of doubt"],
      [73.10, "I got toxins in my bloodstream"],
      [76.42, "You tried hard to suck them out"],
      [79.83, "And it feels like medication"],
      [83.35, "And it's good for me I'm sure"],
      [86.12, "But it don't matter how your love feels anymore"],
      [91.76, "It'll never be the cure"],
      [98.50, "It'll never be the cure"],
      [107.19, "Used to play a game in my head when I'd date a guy"],
      [113.95, "Tally up the girls that he fucked 'til I start to cry"],
      [119.58, "I thought I found the antidote this time"],
      [126.29, "I thought I found the antidote this time"],
      [132.55, "But I'm unraveled"],
      [134.84, "I'm unraveled"],
      [136.54, "I'm unraveled"],
      [138.14, "I'm unraveled"],
      [139.94, "I'm unraveled"],
      [141.48, "I'm unraveled"],
      [143.14, "I'm unraveled"],
      [144.81, "I'm unraveled"],
      [146.57, "And my head is full of poison"],
      [149.72, "And my heart is full of doubt"],
      [153.02, "I got toxins in my bloodstream"],
      [156.45, "You tried hard to suck them out"],
      [159.86, "And it feels like medication"],
      [163.17, "And it's good for me I'm sure"],
      [166.19, "But it don't matter how your love feels anymore"],
      [171.88, "It'll never be the cure"],
      [178.62, "It'll never be the cure"],
      [183.12, "Ohh"],
      [185.48, "'Cause baby I'm unraveled"],
      [188.08, "I'm unraveled"],
      [189.60, "I'm unraveled"],
      [191.50, "I'm unraveled"],
      [193.16, "I'm unraveled"],
      [194.83, "I'm unraveled"],
      [196.36, "I'm unraveled"],
      [198.12, "I'm unraveled"],
      [199.85, "I'm unraveled"],
      [200.85, "Why can't you come stitch me up?"],
      [204.38, "Why can't it ever be enough?"],
      [207.77, "Why can't you come stitch me up?"],
      [211.06, "Why can't it ever be enough?"],
      [219.67, "It's not enough"],
      [225.86, "Oh because my head is full of poison"],
      [229.92, "And my heart is full of doubt"],
      [233.01, "I got toxins in my bloodstream"],
      [236.55, "You tried so hard to suck out"],
      [239.74, "And it feels like medication"],
      [243.18, "And it's good for me I'm sure"],
      [246.15, "But it don't matter how your love feels anymore"],
      [251.99, "It'll never be the cure"],
      [258.52, "It'll never be the cure"],
      [264.78, "It'll never be"]
    ],
    "The One That Got Away": [
      [3.24, "Summer after high school, when we first met"],
      [6.96, "We'd make out in your Mustang to Radiohead"],
      [10.45, "And on my 18th birthday, we got matching tattoos"],
      [17.34, "Used to steal your parents' liquor and climb to the roof"],
      [21.20, "Talk about our future like we had a clue"],
      [25.06, "Never planned that one day, I'd be losing you"],
      [30.41, "In another life"],
      [33.97, "I would be your girl"],
      [37.33, "We'd keep all our promises"],
      [40.78, "Be us against the world"],
      [44.51, "In another life"],
      [48.14, "I would make you stay"],
      [51.72, "So I don't have to say you were"],
      [54.91, "The one that got away"],
      [58.76, "The one that got away"],
      [62.56, "I was June, and you were my Johnny Cash"],
      [65.85, "Never one without the other, we made a pact"],
      [69.71, "Sometimes when I miss you, I put those records on, whoa"],
      [76.77, "Someone said you had your tattoo removed"],
      [80.52, "Saw you downtown singing the blues"],
      [84.09, "It's time to face the music, I'm no longer your muse"],
      [89.23, "But in another life"],
      [93.12, "I would be your girl"],
      [96.57, "We'd keep all our promises"],
      [99.69, "Be us against the world"],
      [103.80, "In another life"],
      [107.11, "I would make you stay"],
      [110.72, "So I don't have to say you were"],
      [114.12, "The one that got away"],
      [117.90, "The one that got away"],
      [121.39, "The one"],
      [125.06, "The one"],
      [128.56, "The one"],
      [132.14, "The one that got away"],
      [135.51, "All this money can't buy me a time machine, no"],
      [143.17, "Can't replace you with a million rings, no"],
      [150.31, "I should've told you what you meant to me, whoa"],
      [157.33, "'Cause now I pay the price"],
      [161.15, "In another life"],
      [164.54, "I would be your girl"],
      [168.21, "We'd keep all our promises"],
      [171.55, "Be us against the world"],
      [175.58, "In another life"],
      [178.93, "I would make you stay"],
      [182.26, "So I don't have to say you were"],
      [185.85, "The one that got away"],
      [189.69, "The one that got away"],
      [193.12, "The one (the one)"],
      [196.66, "The one (the one)"],
      [200.27, "The one (the one)"],
      [203.95, "In another life"],
      [207.66, "I would make you stay"],
      [210.90, "So I don't have to say you were"],
      [214.47, "The one that got away"],
      [218.23, "The one that got away"]
    ],
    "Tarot": [
      [32.53, "Nama yang sama bertahan"], [37.18, "Dalam ruangan hening"], [40.99, "Tanpa suara, bertahan"], [45.10, "Tak bergeming"], [49.23, "Terlalu lama bercanda"], [53.86, "Kita tak terbiasa"], [57.76, "Dengan celaka yang nyata"], [62.29, "Diam, tak berdaya"], [66.52, "Namun, aku bingung kenapa ku tak pergi"], [71.48, "Aku bingung kalian masih di sini"], [75.58, "Apa mungkin kar'na terlalu lama?"], [79.86, "Apa benar 'tuk berbagi derita?"], [83.93, "Mungkin nanti semua justru memburuk"], [88.03, "Hati-hati, namun terjatuh lagi"], [92.34, "Tapi luka adalah niscaya"], [96.47, "Kutanggung denganmu s'lama ku mampu"], [103.55, "S'lama ku mampu"], [117.59, "Di kehidupan kedua (di kehidupan kedua)"], [120.58, "S'moga kau tak terlalu keras kepala"], [124.93, "Atau mungkin ini bukan yang pertama (ini bukan yang pertama)"], [129.16, "Dan kita dib'ri kesempatan berubah"], [133.20, "Ku yakin nyawa kita bertautan"], [138.37, "Khatam berbagai cobaan"], [141.58, "Selalu menertawakan ramalan bintang, kartu tarot"], [147.01, "Orang pintar pembaca nasib"], [150.07, "Namun, aku bingung kenapa ku tak pergi"], [154.91, "Aku bingung kalian masih di sini"], [159.05, "Apa mungkin kar'na terlalu lama?"], [163.14, "Apa benar 'tuk berbagi derita?"], [167.35, "Mungkin nanti semua justru memburuk"], [171.57, "Hati-hati, namun terjatuh lagi"], [175.77, "Tapi luka adalah niscaya"], [179.84, "Kutanggung denganmu s'lama ku mampu"], [186.77, "(S'lama ku mampu)"], [191.57, "Selalu menertawakan ramalan bintang, kartu tarot"], [197.08, "Orang pintar pembaca nasib"], [200.03, "Namun, padamu ku percaya"], [210.93, "Tak masuk logika"], [219.28, "Padamu ku percaya"], [227.66, "Tak masuk logika (tak masuk logika)"], [236.02, "Padamu ku percaya (padamu ku percaya)"], [244.47, "Tak masuk logika (tak masuk logika)"], [252.72, "Padamu ku percaya (padamu ku percaya)"], [260.96, "Tak masuk logika (tak masuk logika)"], [269.40, "Padamu ku percaya, oh"], [277.87, "Tak masuk logika"]
    ],
    "Let Down": [
      [21.83, "Transport, motorways and tramlines"], [28.87, "Starting and then stopping"], [33.57, "Taking off and landing"], [38.25, "The emptiest of feelings"], [42.96, "Disappointed people"], [47.66, "Clinging onto bottles"], [52.35, "When it comes, it's so, so disappointing"], [59.56, "Let down and hanging around"], [66.52, "Crushed like a bug in the ground"], [73.69, "Let down and hanging around"], [90.13, "Shell smashed, juices flowing"], [94.75, "Wings twitch, legs are going"], [99.44, "Don't get sentimental"], [104.08, "It always ends up drivel"], [108.83, "One day, I am gonna grow wings"], [115.72, "A chemical reaction"], [120.34, "Hysterical and useless"], [125.00, "Hysterical and"], [127.48, "Let down and hanging around"], [134.48, "Crushed like a bug in the ground"], [141.62, "Let down and hanging around"], [186.33, "Let down and hang"], [195.72, "Let down and hang"], [205.31, "Let down and hang"], [221.29, "You know, you know where you are with"], [227.91, "You know where you are with"], [232.53, "Floor collapses, floating"], [237.27, "Bouncing back"], [238.95, "And one day, I am gonna grow wings"], [246.42, "A chemical reaction (you'll know where you are)"], [250.92, "Hysterical and useless (you'll know where you are)"], [255.68, "Hysterical and (you'll know where you are)"], [258.49, "Let down, and hanging around"], [265.00, "Crushed like a bug in the ground"], [272.03, "Let down and hanging around"]
    ],
"Treat You Better": [
  [11.93, "I won't lie to you"],
  [16.66, "I know he's just not right for you"],
  [22.75, "And you can tell me if I'm off"],
  [24.15, "But I see it on your face"],
  [25.60, "When you say that he's the one that you want"],
  [28.56, "And you're spending all your time in this wrong situation"],
  [31.50, "And anytime you want it to stop"],
  [33.89, "I know I can treat you better than he can"],
  [39.47, "And any girl like you deserves a gentleman"],
  [45.28, "Tell me, why are we wasting time on all your wasted crime"],
  [48.47, "When you should be with me instead?"],
  [51.52, "I know I can treat you better, better than he can"],
  [58.02, "I'll stop time for you"],
  [62.77, "The second you say you'd like me too"],
  [69.06, "I just wanna give you the loving that you're missing"],
  [72.04, "Baby, just to wake up with you"],
  [74.56, "It'd be everything I need and this could be so different"],
  [78.01, "Tell me what you want to do"],
  [79.76, "'Cause I know I can treat you better than he can"],
  [85.68, "And any girl like you deserves a gentleman"],
  [91.36, "Tell me, why are we wasting time on all your wasted crime"],
  [95.15, "When you should be with me instead?"],
  [97.33, "I know I can treat you better, better than he can"],
  [108.34, "Better than he can"],
  [116.10, "Give me a sign, take my hand, we'll be fine"],
  [121.08, "Promise I won't let you down"],
  [126.54, "Just know that you don't have to do this alone"],
  [132.69, "Promise, I'll never let you down"],
  [138.03, "'Cause I know I can treat you better than he can"],
  [143.68, "And any girl like you deserves a gentleman"],
  [149.31, "Tell me, why are we wasting time on all your wasted crime"],
  [152.96, "When you should be with me instead?"],
  [155.35, "I know I can treat you better, better than he can, oh"],
  [166.26, "Better than he can"],
  [171.82, "Better than he can"]
],
 "Beauty and a Beat": [
  [3.58, "Yeah"],
  [6.67, "Young Money"],
  [9.39, "Nicki Minaj"],
  [10.71, "Justin', rrrr"],
  [14.70, "Show you off"],
  [17.32, "Tonight, I wanna show you off (ay, ay, ay)"],
  [22.29, "What you got, ah, ah"],
  [24.96, "A billion could've never bought (ay, ay, ay)"],
  [30.02, "We gonna party like it's 3012 tonight"],
  [33.83, "I wanna show you all the finer things in life"],
  [37.55, "So, just forget about the world, we young tonight"],
  [41.20, "I'm comin' for ya, I'm comin' for ya"],
  [44.31, "'Cause all I need is a beauty and a beat"],
  [53.54, "Who can make my life complete"],
  [59.10, "It's all 'bout you"],
  [64.74, "When the music makes you move"],
  [68.53, "Baby, do it like you do, 'cause all"],
  [89.87, "Body rock"],
  [92.41, "Girl, I can feel your body rock, yeah (ay, ay, ay)"],
  [97.33, "Take a bow, ah-ah"],
  [99.72, "You're on the hottest ticket now, ooh (ay, ay, ay)"],
  [105.03, "We gonna party like it's 3012 tonight"],
  [108.71, "I wanna show you all the finer things in life"],
  [112.44, "So, just forget about the world, we young tonight"],
  [116.38, "I'm comin' for ya, I'm comin' for ya"],
  [119.20, "'Cause all I need is a beauty and a beat"],
  [128.48, "Who can make my life complete"],
  [134.19, "It's all 'bout you"],
  [139.65, "When the music makes you move"],
  [143.44, "Baby, do it like you do (uh, uh), 'cause all"],
  [149.69, "In time, ink lines"],
  [151.44, "Bi-bi-bitches couldn't get on my incline"],
  [153.61, "World tours, i-i-it's mine"],
  [155.59, "Ten little letters on a big sign"],
  [157.35, "Justin Bieber, you know I'ma hit 'em with the ether"],
  [161.02, "Buns out, wiener"],
  [162.93, "But I gotta keep an eye out for Selena (ow!)"],
  [164.74, "Beauty, beauty and the beast"],
  [166.18, "Beauty from the East"],
  [167.24, "Beautiful confessions of the priest"],
  [168.58, "Beast, beauty from the streets"],
  [169.94, "Beat will get deceased"],
  [171.04, "Every time beauty on the beat eats"],
  [172.49, "Body rock, oh (yeah, yeah, yeah)"],
  [175.19, "I wanna feel your body rock (yeah, let's go, let's go)"],
  [179.25, "'Cause all I need (all I need is love) is a beauty and a beat"],
  [188.54, "Who can make my life complete (oh-oh-oh, oh-whoa)"],
  [194.21, "It's all 'bout you (all I need is you)"],
  [199.83, "When the music makes you move"],
  [203.66, "Baby, do it like you do, 'cause all"]
]
  };
  var currentLyrics = [];

  var wakeLock = null;
  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) {
      return;
    }
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      keepAwakeBtn.classList.add('active');
      var textNode = Array.from(keepAwakeBtn.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim() !== "");
      if (textNode) textNode.nodeValue = " Layar Aktif";
      
      wakeLock.addEventListener('release', function() {
        keepAwakeBtn.classList.remove('active');
        var textNode = Array.from(keepAwakeBtn.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim() !== "");
        if (textNode) textNode.nodeValue = " Jaga Layar";
        wakeLock = null;
      });
    } catch (err) {
      console.warn('Wake Lock gagal:', err);
    }
  }

  function releaseWakeLock() {
    if (wakeLock !== null) {
      wakeLock.release();
      wakeLock = null;
      keepAwakeBtn.classList.remove('active');
      var textNode = Array.from(keepAwakeBtn.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim() !== "");
      if (textNode) textNode.nodeValue = " Jaga Layar";
    }
  }

  if (keepAwakeBtn) {
    keepAwakeBtn.addEventListener('click', function() {
      if (wakeLock === null) requestWakeLock();
      else releaseWakeLock();
    });
  }

  audio.addEventListener('pause', releaseWakeLock);
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      releaseWakeLock();
    } else if (!audio.paused && wakeLock === null) {
      requestWakeLock();
    }
  });

  if(!audio || !box || !inner) return;

  searchBox.addEventListener("input", function(){
    var q = this.value.toLowerCase();
    var cards = songGrid.querySelectorAll(".song-card");
    cards.forEach(function(card){
      var title = card.querySelector(".card-title").textContent.toLowerCase();
      if(title.includes(q)) card.style.display = "flex"; else card.style.display = "none";
    });
  });

  songGrid.addEventListener("click", function(e){
    var card = e.target.closest(".song-card");
    if(!card) return;
    var src = card.getAttribute("data-src");
    var title = card.getAttribute("data-title");
    var artist = card.getAttribute("data-artist");
    nowPlayingTitle.textContent = title;
    nowPlayingArtist.textContent = artist;
    playerTitle.textContent = title + " — " + artist;
    currentLyrics = SONGS_DATA[title] || [];
    renderLyrics();
    audio.src = src;
    audio.load();
    playBtn.textContent = "▶";
    libraryView.hidden = true;
    playerView.hidden = false;
    window.scrollTo(0,0);
  });

  backBtn.addEventListener("click", function(){
    audio.pause();
    releaseWakeLock();
    libraryView.hidden = false;
    playerView.hidden = true;
    window.scrollTo(0,0);
  });

  function renderLyrics() {
    inner.innerHTML = "";
    inner.style.transform = "translateY(0px)";
    currentLyrics.forEach(function(item){
      var p = document.createElement("p");
      p.className = "line" + (item[2] ? " " + item[2] : "");
      p.textContent = item[1];
      p.dataset.t = item[0];
      inner.appendChild(p);
    });
  }

  function fmt(s){
    if(!isFinite(s)) return "0:00";
    var m = Math.floor(s/60), r = Math.floor(s%60);
    return m + ":" + (r<10?"0":"") + r;
  }

  function updateLyrics(){
    if(!currentLyrics.length) return;
    var t = audio.currentTime, idx = -1;
    for(var i=0; i<currentLyrics.length; i++){
      if(t >= currentLyrics[i][0]) idx = i; else break;
    }
    var els = inner.querySelectorAll(".line");
    els.forEach(function(el, i){
      var isGlitch = el.className.indexOf("glitch-red") !== -1;
      el.className = "line" + (isGlitch ? " glitch-red" : "");
      el.classList.toggle("active", i === idx);
      el.classList.toggle("passed", i < idx);
    });
    if(idx >= 0 && els[idx]){
      var el = els[idx];
      var targetY = el.offsetTop - (box.clientHeight / 2) + (el.offsetHeight / 2);
      if(targetY < 0) targetY = 0;
      inner.style.transform = "translateY(-" + targetY + "px)";
    }
  }

  function sync(){
    updateLyrics();
    if(audio.duration) seek.value = (audio.currentTime/audio.duration)*100;
    tCur.textContent = fmt(audio.currentTime);
    if(!audio.paused) requestAnimationFrame(sync);
  }

  playBtn.addEventListener("click", function(){
    if(audio.paused){
      audio.play().then(function(){
        playBtn.textContent = "❚❚";
        requestAnimationFrame(sync);
      }).catch(function(){});
    } else {
      audio.pause();
      playBtn.textContent = "▶";
    }
  });

  audio.addEventListener("loadedmetadata", function(){ tDur.textContent = fmt(audio.duration) });
  audio.addEventListener("timeupdate", function(){
    if(audio.duration) seek.value = (audio.currentTime/audio.duration)*100;
    tCur.textContent = fmt(audio.currentTime);
    updateLyrics();
  });
  audio.addEventListener("ended", function(){ 
    playBtn.textContent = "▶"; 
    audio.currentTime = 0; 
    releaseWakeLock(); 
  });
  seek.addEventListener("input", function(){ if(audio.duration) audio.currentTime = (seek.value/100)*audio.duration });
  audio.addEventListener("seeked", updateLyrics);

  var tapSync=document.getElementById("tapSync");
  var tapStart=document.getElementById("tapStart");
  var tapHit=document.getElementById("tapHit");
  var tapDone=document.getElementById("tapDone");
  if(tapSync){
    var rec=[],cur=0;
    tapStart.addEventListener("click",function(){
      if(!currentLyrics.length) return;
      rec=[];cur=0;
      tapStart.hidden=true;
      tapHit.hidden=false;tapDone.hidden=false;
      var textNode = Array.from(tapHit.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim() !== "");
      if(textNode) textNode.nodeValue = " TAP: " + currentLyrics[0][1];
      if(audio.paused){audio.play().catch(function(){})}
    });
    tapHit.addEventListener("click",function(){
      if(cur>=currentLyrics.length-1){
        tapHit.hidden=true;tapDone.hidden=false;
        return;
      }
      rec.push([+audio.currentTime.toFixed(2),currentLyrics[cur][1]]);
      cur++;
      var textNode = Array.from(tapHit.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim() !== "");
      if(textNode) textNode.nodeValue = " TAP: " + currentLyrics[cur][1];
    });
    tapDone.addEventListener("click",function(){
      var out="[\n"+rec.map(function(r){
        return '  ['+r[0]+', '+JSON.stringify(r[1])+']';
      }).join(",\n")+"\n]";
      console.log(out);
      if(navigator.clipboard){navigator.clipboard.writeText(out).then(function(){
        alert("Timing udah di-copy ke clipboard!");
      }).catch(function(){alert("Copy gagal. Lihat di Console (F12).")})}
      else{alert("Lihat timing di Console (F12).")}
      tapStart.hidden=false;
      tapHit.hidden=true;
      tapDone.hidden=true;
    });
  }

  var canvas = document.getElementById("dinoCanvas");
  if(!canvas) return;
  var ctx = canvas.getContext("2d");
  var overlay = document.getElementById("gameOverlay");
  var restartBtn = document.getElementById("restartBtn");
  var gameOverText = document.getElementById("gameOverText");

  var W = 600, H = 200;
  canvas.width = W; canvas.height = H;

  var isRunning = false;
  var isGameOver = false;
  var score = 0;
  var highScore = localStorage.getItem("dinoHighScore") || 0;
  var speed = 6;
  var frame = 0;
  var reqId;
  var groundY = 170; 

  var dino = { x: 50, y: groundY - 44, w: 30, h: 44, vy: 0, gravity: 0.6, jumpForce: -11, isJumping: false };
  var obstacles = [];
  var clouds = [ {x: 100, y: 40, s: 1}, {x: 350, y: 70, s: 1.5}, {x: 550, y: 30, s: 0.8} ];

  function jump() {
    if(!isRunning && !isGameOver) startGame();
    if(isGameOver) return;
    if(!dino.isJumping) {
      dino.vy = dino.jumpForce;
      dino.isJumping = true;
    }
  }

  window.addEventListener("keydown", function(e) {
    if(e.code === "Space" || e.code === "ArrowUp") {
      if(!document.getElementById("game").hidden) {
        e.preventDefault();
        jump();
      }
    }
  });
  
  canvas.addEventListener("pointerdown", function(e) {
    e.preventDefault();
    jump();
  });

  restartBtn.addEventListener("click", function() { startGame(); });

  function startGame() {
    isRunning = true; isGameOver = false; score = 0; speed = 6; frame = 0;
    dino.y = groundY - dino.h; dino.vy = 0; dino.isJumping = false; obstacles = [];
    overlay.classList.add("hidden");
    if(reqId) cancelAnimationFrame(reqId);
    loop();
  }

  function gameOver() {
    isRunning = false; isGameOver = true;
    if(score > highScore) {
      highScore = Math.floor(score);
      localStorage.setItem("dinoHighScore", highScore);
    }
    gameOverText.innerHTML = "Game Over<br><span style='font-size:14px'>Skor: "+Math.floor(score)+" | Tertinggi: "+highScore+"</span>";
    overlay.classList.remove("hidden");
  }

  function loop() {
    if(!isRunning) return;
    update(); draw();
    reqId = requestAnimationFrame(loop);
  }

  function update() {
    frame++; score += 0.1;
    if(frame % 100 === 0 && speed < 15) speed += 0.2;

    dino.y += dino.vy;
    dino.vy += dino.gravity;
    if(dino.y >= groundY - dino.h) {
      dino.y = groundY - dino.h; dino.vy = 0; dino.isJumping = false;
    }

    if(frame > 60 && Math.random() < 0.015) {
      var isTall = Math.random() > 0.5;
      obstacles.push({ x: W, y: isTall ? groundY - 40 : groundY - 25, w: isTall ? 15 : 20, h: isTall ? 40 : 25 });
    }

    for(var i = obstacles.length - 1; i >= 0; i--) {
      var obs = obstacles[i];
      obs.x -= speed;
      var dX = dino.x + 5, dY = dino.y + 5, dW = dino.w - 10, dH = dino.h - 5;
      if(dX < obs.x + obs.w && dX + dW > obs.x && dY < obs.y + obs.h && dY + dH > obs.y) {
        gameOver(); return;
      }
      if(obs.x + obs.w < 0) obstacles.splice(i, 1);
    }

    clouds.forEach(function(c) {
      c.x -= speed * 0.1;
      if(c.x < -60) { c.x = W + 60; c.y = Math.random() * 60 + 20; }
    });
  }

  function draw() {
    var grad = ctx.createLinearGradient(0, 0, 0, groundY);
    grad.addColorStop(0, "#2b1055"); grad.addColorStop(0.5, "#d83f87"); grad.addColorStop(1, "#ff9a44"); 
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, groundY);

    ctx.fillStyle = "#ffd36e"; ctx.beginPath(); ctx.arc(W/2, groundY - 30, 40, Math.PI, 0); ctx.fill();

    ctx.fillStyle = "#5d2a72"; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(100, groundY - 100); ctx.lineTo(250, groundY - 40); ctx.lineTo(400, groundY - 120); ctx.lineTo(W, groundY - 50); ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#8e3b7e"; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(150, groundY - 50); ctx.lineTo(300, groundY - 80); ctx.lineTo(450, groundY - 30); ctx.lineTo(W, groundY - 70); ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#ffffff";
    clouds.forEach(function(c) { ctx.fillRect(c.x, c.y, 30 * c.s, 8 * c.s); ctx.fillRect(c.x + 8 * c.s, c.y - 6 * c.s, 16 * c.s, 6 * c.s); ctx.fillRect(c.x + 18 * c.s, c.y - 4 * c.s, 10 * c.s, 4 * c.s); });

    ctx.fillStyle = "#1e0d29"; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = "#ff9a44"; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = "#1e0d29";
    obstacles.forEach(function(obs) { ctx.fillRect(obs.x, obs.y, obs.w, obs.h); if(obs.w === 15) { ctx.fillRect(obs.x - 6, obs.y + 15, 27, 6); } else { ctx.fillRect(obs.x - 4, obs.y + 10, 28, 5); } });

    var dx = dino.x, dy = dino.y;
    ctx.fillRect(dx, dy + 15, 25, 20); ctx.fillRect(dx - 5, dy + 5, 10, 15); ctx.fillRect(dx + 15, dy, 15, 20); ctx.fillRect(dx + 25, dy + 10, 8, 6);
    ctx.fillStyle = "#ff9a44"; ctx.fillRect(dx + 23, dy + 4, 4, 4);
    ctx.fillStyle = "#1e0d29"; ctx.fillRect(dx + 18, dy + 20, 8, 4);
    if(!dino.isJumping && frame % 10 < 5) { ctx.fillRect(dx + 5, dy + 35, 6, 9); ctx.fillRect(dx + 17, dy + 35, 6, 5); } else { ctx.fillRect(dx + 5, dy + 35, 6, 5); ctx.fillRect(dx + 17, dy + 35, 6, 9); }

    ctx.fillStyle = "#fff"; ctx.font = "700 16px 'Pixelify Sans', monospace"; ctx.textAlign = "right"; ctx.fillText("HI " + Math.floor(highScore).toString().padStart(4, '0') + "  " + Math.floor(score).toString().padStart(4, '0'), W - 20, 30);
  }

  function initDraw() {
    var grad = ctx.createLinearGradient(0, 0, 0, groundY);
    grad.addColorStop(0, "#2b1055"); grad.addColorStop(0.5, "#d83f87"); grad.addColorStop(1, "#ff9a44"); 
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, groundY);
    ctx.fillStyle = "#ffd36e"; ctx.beginPath(); ctx.arc(W/2, groundY - 30, 40, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#5d2a72"; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(100, groundY - 100); ctx.lineTo(250, groundY - 40); ctx.lineTo(400, groundY - 120); ctx.lineTo(W, groundY - 50); ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#8e3b7e"; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(150, groundY - 50); ctx.lineTo(300, groundY - 80); ctx.lineTo(450, groundY - 30); ctx.lineTo(W, groundY - 70); ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffffff"; clouds.forEach(function(c) { ctx.fillRect(c.x, c.y, 30 * c.s, 8 * c.s); ctx.fillRect(c.x + 8 * c.s, c.y - 6 * c.s, 16 * c.s, 6 * c.s); ctx.fillRect(c.x + 18 * c.s, c.y - 4 * c.s, 10 * c.s, 4 * c.s); });
    ctx.fillStyle = "#1e0d29"; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = "#ff9a44"; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.lineWidth = 2; ctx.stroke();
    var dx = dino.x, dy = dino.y;
    ctx.fillStyle = "#1e0d29"; ctx.fillRect(dx, dy + 15, 25, 20); ctx.fillRect(dx - 5, dy + 5, 10, 15); ctx.fillRect(dx + 15, dy, 15, 20); ctx.fillRect(dx + 25, dy + 10, 8, 6);
    ctx.fillStyle = "#ff9a44"; ctx.fillRect(dx + 23, dy + 4, 4, 4);
    ctx.fillStyle = "#1e0d29"; ctx.fillRect(dx + 18, dy + 20, 8, 4); ctx.fillRect(dx + 5, dy + 35, 6, 9); ctx.fillRect(dx + 17, dy + 35, 6, 5);
    ctx.fillStyle = "#fff"; ctx.font = "700 16px 'Pixelify Sans', monospace"; ctx.textAlign = "right"; ctx.fillText("HI " + Math.floor(highScore).toString().padStart(4, '0'), W - 20, 30);
  }
  initDraw();
})();

// ============================================
// === CHAT .MENU INTERAKTIF + AI PUTER ===
// ============================================
(function(){
  var box = document.getElementById("chatBox");
  var form = document.getElementById("chatForm");
  var input = document.getElementById("chatInput");
  if(!box || !form || !input) return;

  var FEATURES = {
    ".menu": "Kurumi MD: halo! ada 1500+ fitur di sini.\nKurumi MD: ketik nama fitur untuk mulai.\n\nFitur tersedia:\n- .menu      → tampilkan menu ini\n- .ping      → cek latensi bot\n- .sticker   → buat stiker dari gambar\n- .ai        → tanya AI\n- .about     → info bot",
    ".ping": "Kurumi MD: 🏓 Pong! Latensi 42ms.",
    ".sticker": "Kurumi MD: kirim gambar dengan caption .sticker untuk dijadikan stiker.",
    ".ai": "Kurumi MD: fitur AI sedang dalam pengembangan.",
    ".about": "Kurumi MD: Kurumi MD v0.1 — bot WhatsApp multi device dengan 1500+ fitur."
  };

  function addMsg(text, who){
    var wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper " + who;

    var d = document.createElement("div");
    d.className = "msg " + who;
    d.textContent = text;
    wrapper.appendChild(d);

    // Kalau pesan dari bot, tambahin tombol copy
    if (who === "bot") {
      var btnCopy = document.createElement("button");
      btnCopy.className = "btn-copy-msg";
      btnCopy.innerHTML = "📋 Copy";
      
      btnCopy.onclick = function() {
        navigator.clipboard.writeText(text).then(function() {
          btnCopy.innerHTML = "✅ Tercopy!";
          setTimeout(function() { btnCopy.innerHTML = "📋 Copy"; }, 2000);
        }).catch(function() {
          // Fallback buat HP yang rewel
          var textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          btnCopy.innerHTML = "✅ Tercopy!";
          setTimeout(function() { btnCopy.innerHTML = "📋 Copy"; }, 2000);
        });
      };
      wrapper.appendChild(btnCopy);
    }

    box.appendChild(wrapper);
    box.scrollTop = box.scrollHeight;
    return wrapper;
  }

  function botReply(cmd){
    var reply = FEATURES[cmd.toLowerCase()];
    if(reply){
      addMsg(reply, "bot");
    } else {
      if(typeof puter === "undefined" || !puter.ai){
        addMsg('Kurumi MD: fitur "' + cmd + '" tidak ditemukan. Ketik .menu untuk lihat daftar fitur.', "bot");
        return;
      }

      var loadingMsg = addMsg("Kurumi MD: bentar, mikir dulu...", "bot");

      puter.ai.chat(
        "Kamu adalah Kurumi MD, bot WhatsApp yang ramah dan helpful. Jawab singkat, santai, dan dalam Bahasa Indonesia. Pertanyaan user: " + cmd,
        { model: 'gpt-5.4-nano' }
      )
        .then(function(response){
          if(loadingMsg && loadingMsg.parentNode) loadingMsg.remove();
          addMsg("Kurumi MD: " + response, "bot");
        })
        .catch(function(error){
          if(loadingMsg && loadingMsg.parentNode) loadingMsg.remove();
          addMsg("Kurumi MD: maaf, AI-nya lagi error. Coba lagi nanti ya.", "bot");
        });
    }
  }

  form.addEventListener("submit", function(e){
    e.preventDefault();
    var val = input.value.trim();
    if(!val) return;
    addMsg(val, "user");
    input.value = "";
    setTimeout(function(){ botReply(val); }, 400);
  });

  document.addEventListener("masuk", function(){
    if(box.children.length === 0){
      setTimeout(function(){
        addMsg("Kurumi MD: halo! ada 1500+ fitur di sini.\nKurumi MD: ketik nama fitur untuk mulai.", "bot");
      }, 500);
    }
  });
})();

// ============================================
// === API DEVELOPER LOGIC ===
// ============================================
(function(){
  var btnGenerate = document.getElementById("btnGenerateKey");
  var apiName = document.getElementById("apiName");
  var keyResult = document.getElementById("keyResult");
  var generatedKey = document.getElementById("generatedKey");
  
  var btnTest = document.getElementById("btnTestApi");
  var testNumber = document.getElementById("testNumber");
  var testMessage = document.getElementById("testMessage");
  var apiResponse = document.getElementById("apiResponse");
  var responseText = document.getElementById("responseText");

  if(!btnGenerate) return;

  btnGenerate.addEventListener("click", function(){
    var name = apiName.value.trim();
    if(!name){
      alert("Isi nama aplikasi/bot dulu ya!");
      return;
    }

    var randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var apiKey = "valen_sk_" + randomStr;
    
    localStorage.setItem("valen_api_key", apiKey);
    localStorage.setItem("valen_api_name", name);

    generatedKey.textContent = apiKey;
    keyResult.style.display = "block";
    apiName.value = "";
    
    btnGenerate.textContent = "Tersimpan!";
    btnGenerate.disabled = true;
    btnGenerate.style.background = "var(--win)";
    btnGenerate.style.color = "var(--ink)";
  });

  var existingKey = localStorage.getItem("valen_api_key");
  if(existingKey){
    generatedKey.textContent = existingKey;
    keyResult.style.display = "block";
    btnGenerate.textContent = "Sudah Tergenerate";
    btnGenerate.disabled = true;
  }

  btnTest.addEventListener("click", function(){
    var key = localStorage.getItem("valen_api_key");
    
    if(!key){
      alert("Generate API Key dulu di bagian atas!");
      return;
    }
    
    if(!testNumber.value || !testMessage.value){
      alert("Nomor dan pesan tidak boleh kosong!");
      return;
    }

    apiResponse.style.display = "block";
    responseText.textContent = "Mengirim request...";
    btnTest.disabled = true;

    setTimeout(function(){
      var mockResponse = {
        status: "success",
        message: "Pesan berhasil masuk antrean.",
        data: {
          to: testNumber.value,
          body: testMessage.value,
          timestamp: new Date().toISOString(),
          api_key_used: key.substring(0, 12) + "..."
        }
      };

      responseText.textContent = JSON.stringify(mockResponse, null, 2);
      
      testNumber.value = "";
      testMessage.value = "";
      btnTest.disabled = false;
    }, 1500); 
  });
})();

// ============================================
// === PAIRING BOT LOGIC (DARI WEB UTAMA) ===
// ============================================
(function(){
  var btnPairing = document.getElementById("btnPairing");
  var waNumber = document.getElementById("waNumber");
  var resultBox = document.getElementById("pairingResult");
  var codeDisplay = document.getElementById("pairingCodeDisplay");

  if(!btnPairing) return;

  // ALAMAT NGROK LU
  var API_URL = "https://seismic-plug-striving.ngrok-free.dev/api/pairing";

  btnPairing.addEventListener("click", async function(){
    var phone = waNumber.value.trim();
    if(!phone){
      alert("Masukin nomor WhatsApp dulu!");
      return;
    }

    btnPairing.disabled = true;
    btnPairing.textContent = "Memproses...";
    resultBox.style.display = "none";

    try {
      var response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true" // WAJIB BUAT NGROK
        },
        body: JSON.stringify({ phoneNumber: phone })
      });

      var data = await response.json();

      if (response.ok && data.status === "success") {
        codeDisplay.textContent = data.code;
        resultBox.style.display = "block";
        btnPairing.textContent = "Berhasil!";
        waNumber.value = ""; 
      } else {
        throw new Error(data.message || "Gagal dapet kode");
      }
    } catch (error) {
      alert("Error: " + error.message);
      btnPairing.disabled = false;
      btnPairing.textContent = "Minta Kode";
    }
  });
})();

// ============================================
// === PROTEKSI ISENG (BUKAN KEAMANAN BENERAN) ===
// ============================================
(function(){
  document.addEventListener("contextmenu", function(e){
    e.preventDefault();
  });

  document.addEventListener("keydown", function(e){
    if(e.key === "F12"){ e.preventDefault(); return false; }
    if(e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())){
      e.preventDefault(); return false;
    }
    if(e.ctrlKey && e.key.toUpperCase() === "U"){
      e.preventDefault(); return false;
    }
    if(e.ctrlKey && e.key.toUpperCase() === "S"){
      e.preventDefault(); return false;
    }
  });

  var overlay = document.createElement("div");
  overlay.id = "devtoolsGuard";
  overlay.innerHTML = "<div>Tutup DevTools dulu ya 🙏<br><small>Website ini nggak bisa dilihat selama DevTools kebuka.</small></div>";
  overlay.style.cssText = [
    "position:fixed","inset:0","z-index:99999",
    "background:rgba(0,0,0,.92)","color:#7dffa8",
    "display:none","place-items:center","text-align:center",
    "font:700 18px/1.5 'Pixelify Sans',monospace",
    "padding:24px"
  ].join(";");
  document.body.appendChild(overlay);

  var devtoolsOpen = false;
  function checkDevTools(){
    var wDiff = window.outerWidth - window.innerWidth;
    var hDiff = window.outerHeight - window.innerHeight;
    var open = wDiff > 160 || hDiff > 160;
    if(open !== devtoolsOpen){
      devtoolsOpen = open;
      overlay.style.display = open ? "grid" : "none";
    }
  }
  setInterval(checkDevTools, 800);

  // --- 3. Text freezer ringan (DIMODIFIKASI AGAR CHAT BISA DI-COPY) ---
  var frozen = new WeakMap();
  
  function freezeNode(node){
    if(node.nodeType === 3 && !frozen.has(node)){
      // Cek apakah node ini ada di dalam #chatBox. Kalau iya, jangan di-freeze!
      if (node.parentNode && node.parentNode.closest('#chatBox')) return;
      
      frozen.set(node, node.nodeValue);
    }
  }
  
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  var n;
  while(n = walker.nextNode()) freezeNode(n);

  var mo = new MutationObserver(function(muts){
    muts.forEach(function(m){
      // Kalau yang diedit adalah teks di dalam chat, biarin aja (jangan di-reset)
      if (m.target.parentNode && m.target.parentNode.closest('#chatBox')) return;

      if(m.type === "characterData" && frozen.has(m.target)){
        var orig = frozen.get(m.target);
        if(m.target.nodeValue !== orig){
          m.target.nodeValue = orig;
        }
      }
      if(m.type === "childList"){
        m.addedNodes.forEach(function(nd){
          if(nd.nodeType === 3) freezeNode(nd);
          else if(nd.nodeType === 1){
            var w2 = document.createTreeWalker(nd, NodeFilter.SHOW_TEXT);
            var n2;
            while(n2 = w2.nextNode()) freezeNode(n2);
          }
        });
      }
    });
  });
  mo.observe(document.body, {characterData:true, childList:true, subtree:true});
})();

// ============================================
// === CHAT GLOBAL REAL-TIME (SOCKET.IO) ===
// ============================================
(function(){
  if (typeof io === "undefined") return;

  var globalBox = document.getElementById("globalChatBox");
  var globalInput = document.getElementById("globalInput");
  var globalSendBtn = document.getElementById("globalSendBtn");
  var globalUser = document.getElementById("globalUser");

  if (!globalBox || !globalInput) return;

  // Ambil data user dari localStorage
  var savedName = localStorage.getItem('valen_name') || "Anonim";
  var savedTitle = localStorage.getItem('valen_title') || 'USER';
  var savedTag = localStorage.getItem('valen_tag') || '0';

  if(globalUser) globalUser.value = savedName;

  globalBox.innerHTML = '<div style="color:#888; font-size:12px; text-align:center;">Menghubungkan...</div>';

  // Warna Avatar diambil dari nama biar tetep variatif
  function getColorFromName(name) {
    var colors = ["#ff5a5a", "#5aff7a", "#5a9dff", "#f2d94e", "#ff5af2", "#5afff2", "#ffa05a"];
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  // Warna Title sesuai permintaan lu
  function getTitleStyle(title) {
    switch(title) {
      case 'DEVELOPER': return { bg: '#000', color: '#fff', border: '1px solid #ff0000', class: 'title-dev' };
      case 'VIP': return { bg: '#333', color: '#fff', border: '1px solid #f2d94e' }; 
      case 'USER': return { bg: '#8B4513', color: '#fff' }; // Cokelat
      case 'NOLEP': return { bg: '#fff', color: '#000' }; // Putih
      case 'WIBU': return { bg: '#00008B', color: '#fff' }; // Biru Tua
      default: return { bg: '#888', color: '#fff' };
    }
  }

  fetch("https://sizable-phantom-rind.ngrok-free.dev/health", {
    headers: { "ngrok-skip-browser-warning": "true" }
  }).then(function() {
    var socket = io("https://sizable-phantom-rind.ngrok-free.dev", {
      transports: ["polling"], extraHeaders: { "ngrok-skip-browser-warning": "true" }, query: { "ngrok-skip-browser-warning": "true" }
    });

    function appendGlobalMsg(user, title, tag, text, time) {
      var wrapper = document.createElement("div");
      wrapper.style.display = "flex"; 
      wrapper.style.alignItems = "flex-start"; 
      wrapper.style.gap = "10px"; 
      wrapper.style.marginBottom = "16px"; // Jarak antar pesan
      
      var userColor = getColorFromName(user);
      var tStyle = getTitleStyle(title);
      var initial = user.charAt(0).toUpperCase();

      // --- AVATAR ---
      var avatar = document.createElement("div");
      avatar.style.cssText = "width:36px; height:36px; border-radius:50%; background:"+userColor+"; color:#000; font-weight:bold; display:flex; align-items:center; justify-content:center; font-family:'Pixelify Sans', monospace; flex-shrink:0; font-size:16px;";
      avatar.textContent = initial;

      // --- KONTEN PESAN ---
      var content = document.createElement("div");
      content.style.flex = "1";
      
      // --- HEADER (Nama, Title, Tag, Waktu) ---
      var titleClass = tStyle.class ? tStyle.class : "";
      var titleBorder = tStyle.border ? "border:"+tStyle.border+";" : "";
      
      var header = document.createElement("div");
      header.style.cssText = "display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;";
      
      header.innerHTML = `
        <b style="color: #fff; font-size: 14px;">${user}</b> 
        <span class="${titleClass}" style="background:${tStyle.bg}; color:${tStyle.color}; ${titleBorder} font-size:9px; padding:2px 6px; border-radius:4px; font-weight:bold;">${title}</span>
        <span style="color:#888; font-weight:bold; font-family:monospace; font-size:11px;">#${tag}</span>
        <span style="color: #555; font-size: 10px; margin-left:auto;">${time}</span>
      `;
      
      // --- BODY (Kotak Bubble Pesan) ---
      var bodyWrapper = document.createElement("div");
      bodyWrapper.style.cssText = "background: #1a1a1a; padding: 8px 12px; border-radius: 0 8px 8px 8px; display: inline-block; max-width: 100%; border-left: 2px solid #333;";
      
      var bodyText = document.createElement("div");
      bodyText.style.cssText = "color:#e0e0e0; font-size:13px; line-height:1.5; word-break:break-word; font-family: 'IBM Plex Mono', monospace;";
      bodyText.textContent = text; 

      bodyWrapper.appendChild(bodyText);
      content.appendChild(header); 
      content.appendChild(bodyWrapper);
      
      wrapper.appendChild(avatar); 
      wrapper.appendChild(content);
      
      globalBox.appendChild(wrapper);
      globalBox.scrollTop = globalBox.scrollHeight;
    }

    socket.on("connect", function() {
      globalBox.innerHTML = ""; 
      appendGlobalMsg("Sistem", "SYSTEM", "0", "Berhasil terhubung ke Chat Global!", "Info");
    });

    socket.on("chat message", function(data) {
      appendGlobalMsg(data.user, data.title, data.tag, data.text, data.time);
    });

    function sendGlobal() {
      var text = globalInput.value.trim();
      if (!text) return;

      socket.emit("chat message", { user: savedName, title: savedTitle, tag: savedTag, text: text });
      globalInput.value = "";
    }

    globalSendBtn.addEventListener("click", sendGlobal);
    globalInput.addEventListener("keypress", function(e) { if (e.key === "Enter") sendGlobal(); });
  });
})();

// ============================================
// === TIKTOK DOWNLOADER (DARI PANEL 2) ===
// ============================================
(function(){
  var btn = document.getElementById("btnTiktok");
  var input = document.getElementById("tiktokUrl");
  var resultBox = document.getElementById("tiktokResult");
  var titleEl = document.getElementById("tiktokTitle");
  var authorEl = document.getElementById("tiktokAuthor");
  var videoEl = document.getElementById("tiktokVideoPreview");
  var photosEl = document.getElementById("tiktokPhotos");
  var buttonsEl = document.getElementById("tiktokButtons");

  if(!btn) return;

  btn.addEventListener("click", async function(){
    var url = input.value.trim();
    if(!url) return alert("Masukin link TikTok dulu bang!");

    btn.disabled = true;
    btn.textContent = "Memproses...";
    resultBox.style.display = "none";
    videoEl.style.display = "none";
    photosEl.innerHTML = "";
    buttonsEl.innerHTML = "";

    try {
      // Nembak ke API Pterodactyl Panel 2
      var response = await fetch("https://sizable-phantom-rind.ngrok-free.dev/api/tiktok", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ url: url })
      });

      var resData = await response.json();

      if (resData.status === "success") {
        var data = resData.data;
        
        titleEl.textContent = data.title;
        authorEl.textContent = "@" + data.author;

        if (data.isPhoto && data.photoUrls.length > 0) {
          // Kalo fotonya banyak
          data.photoUrls.forEach(function(photoUrl) {
            var img = document.createElement("img");
            img.src = photoUrl;
            img.style.cssText = "height: 150px; border-radius: 8px; border: 1px solid #333;";
            photosEl.appendChild(img);
          });
        } else if (data.videoUrl) {
          // Kalo video
          videoEl.src = data.videoUrl;
          videoEl.style.display = "block";

          // Bikin tombol download video
          var a = document.createElement("a");
          a.href = data.videoUrl;
          a.target = "_blank";
          a.textContent = "⬇ Download Video (No WM)";
          a.style.cssText = "padding: 10px 20px; background: var(--bar); color: #fff; text-decoration: none; font-weight: bold; border-radius: 4px; border: 1px solid var(--hi);";
          buttonsEl.appendChild(a);
        }

        resultBox.style.display = "block";
        btn.textContent = "Berhasil!";
      } else {
        throw new Error(resData.message || "Gagal mengambil data.");
      }
    } catch (error) {
      alert("Error: " + error.message);
      btn.disabled = false;
      btn.textContent = "Proses";
    }
  });
})();
