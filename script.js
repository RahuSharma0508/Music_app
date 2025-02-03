let currenSong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "0:00"; // Default time when invalid
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Ensure whole number
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
async function getsongs(folder) {
    currfolder = folder
    let a = await fetch(`/songs/${folder}/`)
    let response = await a.text()
        // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let lis = div.getElementsByTagName("li")
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }
    // console.log(lis)
    // console.log(as)
    // console.log(songs)
    //show all songs in the playlist
    let songul = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songul.innerHTML = " "
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20"," ")}</div>
                                    <div>Rahul</div>
                                </div>
                                <div class="palynow">
                                    <span>play now</span>
                                </div>
                                <img src="img/play.svg" class="invert" alt="">
                            </li>`
    }

    //attach an eventlistnerto each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
                playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

            })
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
    });
    return songs

}

const playmusic = (track, pause = false) => {

    // let audio = new Audio("/songs/" + track)
    currenSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currenSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayalbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.querySelectorAll("li a")
        // console.log(div)
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-1)[0]
                // get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
                // console.log(response)
            let cardcontainer = document.querySelector(".cardContainer")
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div class="card" data-folder="${folder}">
                        <div class="play">
                            <svg data-encore-id="icon" role="img" aria-hidden="true" class="Svg-sc-ytk21e-0 bneLcE e-9541-icon" viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div>`
        }
    }
    // load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
                playmusic(songs[0], false)

            })
        })
        // add event listener to previous and next
    previous.addEventListener("click", () => {
        // console.log("previous clicked")
        let index = songs.indexOf(currenSong.src.split("/").slice(-1)[0])
        console.log(songs, index)
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        } else {
            playmusic(songs[songs.length - 1])
        }
    })
    next.addEventListener("click", () => {
        // console.log(currenSong.src.split("/songs/")[1])
        // console.log(currenSong.src.split("/").slice(-1)[0])
        let index = songs.indexOf(currenSong.src.split("/").slice(-1)[0])
        console.log(songs, index)
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        } else {
            playmusic(songs[0])
        }
    })

}

async function main() {

    //get the list of all the songs
    let songs = await getsongs("songs/hindi")
    playmusic(songs[0], true)
        // console.log(songs)

    // display all the albums on the page
    displayalbums()

    // attach an event lishtner to play next and previous
    play.addEventListener("click", () => {
        if (currenSong.paused) {
            currenSong.play()
            play.src = "img/pause.svg"
        } else {
            currenSong.pause()
            play.src = "img/play.svg"
        }
    })

    // listen for time updatae event
    currenSong.addEventListener("timeupdate", () => {
        // console.log(formatTime(currenSong.currentTime), formatTime(currenSong.duration))
        document.querySelector(".songtime").innerHTML = `${formatTime(currenSong.currentTime)} / ${formatTime(currenSong.duration)}`
        document.querySelector(".circle").style.left = (currenSong.currentTime / currenSong.duration) * 100 + "%"
    })

    //attach event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currenSong.currentTime = ((currenSong.duration) * percent / 100)
    })

    // add an eventlistner to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -130 + "%"
    })



    // add eventlistener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {
        // console.log(e, e.target, e.target.value)
        currenSong.volume = parseInt(e.target.value) / 100
    })

    // add eventlishtner to mute the track
    document.querySelector(".volume img").addEventListener("click", e => {
        // console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currenSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currenSong.volume = 10 / 100
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}

main()




//// paly the first song
// var audio = new Audio(songs[0]);
// document.querySelector("#play").addEventListener("click", () => {
//     audio.play();
// })
// audio.addEventListener("loadeddata", () => {

//     console.log(audio.duration, audio.currentSrc, audio.currentTime)
// })
