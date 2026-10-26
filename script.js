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
  // --- LOGIKA MUSIK ---
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
    ]
  };
  var currentLyrics = [];

  // === WAKE LOCK (BENERIN ERROR ALERT) ===
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

  // --- FITUR PENCARIAN ---
  searchBox.addEventListener("input", function(){
    var q = this.value.toLowerCase();
    var cards = songGrid.querySelectorAll(".song-card");
    cards.forEach(function(card){
      var title = card.querySelector(".card-title").textContent.toLowerCase();
      if(title.includes(q)) card.style.display = "flex"; else card.style.display = "none";
    });
  });

  // --- BUKA PLAYER ---
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

  // --- TAP SYNC LOGIC ---
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

  // --- GAME DINO LOGIC ---
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
// === CHAT .MENU INTERAKTIF (BARU DITAMBAHKAN) ===
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
    var d = document.createElement("div");
    d.className = "msg " + who;
    d.textContent = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }

  function botReply(cmd){
    var reply = FEATURES[cmd.toLowerCase()];
    if(reply){
      addMsg(reply, "bot");
    } else {
      addMsg('Kurumi MD: fitur "' + cmd + '" tidak ditemukan. Ketik .menu untuk lihat daftar fitur.', "bot");
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
