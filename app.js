const baseUrl = "http://190.103.64.155:25461";
let username="", password="", currentList=[], currentIndex=0, currentType="";
const player=document.getElementById('videoPlayer');

function login(){
  username=document.getElementById('user').value;
  password=document.getElementById('pass').value;
  fetch(`${baseUrl}/player_api.php?username=${username}&password=${password}`)
    .then(r=>r.json()).then(data=>{
      if(data.user_info && data.user_info.status==="Active"){
        document.getElementById('login').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        loadContent();
      } else alert("Acceso denegado");
    });
}

function loadContent(){
  loadStream("get_live_streams","live");
  loadStream("get_vod_streams","movies");
  loadStream("get_series","series");
}

function loadStream(action,type){
  fetch(`${baseUrl}/player_api.php?username=${username}&password=${password}&action=${action}`)
    .then(r=>r.json()).then(list=>{
      const container=document.getElementById(type);
      container.innerHTML="";
      list.forEach((item,i)=>{
        const div=document.createElement('div');
        div.className="item";
        div.innerHTML=`<img src="${item.stream_icon||'icon.png'}"><div>${item.name}</div>`;
        div.onclick=()=>{
          if(type==="series") showSeasons(item);
          else playContent(item,list,i,type);
        };
        container.appendChild(div);
      });
    });
}

function showSeasons(serie){
  document.getElementById("seasons").classList.remove("hidden");
  document.getElementById("episodes").classList.add("hidden");
  fetch(`${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${serie.series_id}`)
    .then(r=>r.json()).then(data=>{
      const seasonsDiv=document.getElementById("seasons");
      seasonsDiv.innerHTML="<h3>"+serie.name+"</h3>";
      Object.keys(data.seasons).forEach(seasonNum=>{
        const btn=document.createElement("button");
        btn.innerText="Temporada "+seasonNum;
        btn.onclick=()=>showEpisodes(data.episodes[seasonNum]);
        seasonsDiv.appendChild(btn);
      });
    });
}

function showEpisodes(episodes){
  document.getElementById("episodes").classList.remove("hidden");
  const epDiv=document.getElementById("episodes");
  epDiv.innerHTML="";
  episodes.forEach((ep,i)=>{
    const div=document.createElement("div");
    div.className="item";
    div.innerHTML=`<div>${ep.title}</div>`;
    div.onclick=()=>playEpisode(ep);
    epDiv.appendChild(div);
  });
}

function playEpisode(ep){
  const url=`${baseUrl}/series/${username}/${password}/${ep.id}.${ep.container_extension}`;
  player.src=url;
  document.getElementById('playerContainer').classList.remove('hidden');
  player.play();
  document.getElementById('info').innerText=ep.title;
}

function playContent(item,list,index,type){
  currentList=list; currentIndex=index; currentType=type;
  let url="";
  if(type==="live") url=`${baseUrl}/live/${username}/${password}/${item.stream_id}.m3u8`;
  else if(type==="movies") url=`${baseUrl}/movie/${username}/${password}/${item.stream_id}.${item.container_extension}`;
  if(type==="live" && Hls.isSupported()){
    var hls=new Hls(); hls.loadSource(url); hls.attachMedia(player);
  } else player.src=url;
  document.getElementById('playerContainer').classList.remove('hidden');
  player.play();
  updateInfo();
}

function nextContent(){ if(currentIndex+1<currentList.length) playContent(currentList[++currentIndex],currentList,currentIndex,currentType); }
function prevContent(){ if(currentIndex-1>=0) playContent(currentList[--currentIndex],currentList,currentIndex,currentType); }
function toggleFullscreen(){ if(player.requestFullscreen) player.requestFullscreen(); }
function toggleMute(){ player.muted=!player.muted; }
function updateInfo(){
  document.getElementById('info').textContent=currentList[currentIndex]?.name||"";
}