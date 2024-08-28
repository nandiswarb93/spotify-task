import React, { useEffect, useState, useRef } from "react"; //imported hooks
import "./Home.css"; //css file
import Logo from "./Logo.png"; //spotify logo
import axios from "axios"; //for api calling
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaEllipsisH,
  FaStepBackward,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa"; // for react icon

function HomeComponent() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(false);
  const [loader, setLoader] = useState(true);
  const [oneSong, setOneSong] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const [search, setSearch] = useState("");
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState("FOR YOU"); // New state for tab management

  const gradient = [
    "#ffecd2",
    "#2f1a04",
    "#d633ff",
    "#9a1fdd",
    "#ff8fb1",
    "#824d17",
    "#d70f5f",
    "#061147",
  ]; // background colors

  // initial render
  useEffect(() => {
    fetchData();
  }, []);

  // to load the one song at the time of initial render
  useEffect(() => {
    if (data.length > 0 && oneSong === null) {
      setOneSong(data[0]);
    }
  }, [data, oneSong]);

  //this is for song duration and progress bar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", updateProgress);
      audioRef.current.addEventListener("loadedmetadata", updateDuration);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateProgress);
        audioRef.current.removeEventListener("loadedmetadata", updateDuration);
      }
    };
  }, [oneSong]);

  //api calling
  const fetchData = async () => {
    try {
      const { data, status } = await axios.get(
        "https://cms.samespace.com/items/songs"
      );
      if (status === 200) {
        // to get duration of the each song
        const songsWithDuration = await Promise.all(
          data.data.map(async (song) => {
            const audio = new Audio(song.url);
            await new Promise((resolve) => {
              audio.addEventListener("loadedmetadata", () => {
                const minutes = Math.floor(audio.duration / 60);
                const seconds = Math.floor(audio.duration % 60);
                song.duration = `${minutes}:${
                  seconds < 10 ? "0" : ""
                }${seconds}`;
                resolve();
              });
            });
            return song;
          })
        );
        setData(songsWithDuration);
        setFilteredData(songsWithDuration);
        setError(false);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoader(false);
    }
  };

  //back ground colors
  const updateBackgroundColor = (id) => {
    document.body.style.backgroundColor = gradient[id % gradient.length];
  };

  const submitHandler = (obj) => {
    setOneSong(obj);
    setProgress(0);
    setIsPlaying(true);
    updateBackgroundColor(obj.id);
  };

  const updateProgress = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((currentTime / duration) * 100);
    }
  };

  const updateDuration = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
      setDuration(formattedDuration);
    }
  };

  // search functionality
  const searchHandler = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearch(searchValue);

    if (searchValue === "") {
      setFilteredData(data);
    } else {
      const updatedData = data.filter(
        (each) =>
          each.artist.toLowerCase().includes(searchValue) ||
          each.name.toLowerCase().includes(searchValue)
      );
      setFilteredData(updatedData);
    }
  };

  const playPauseHandler = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextSongHandler = () => {
    if (data.length === 0) return;
    const currentIndex = data.findIndex((song) => song.id === oneSong.id);
    const nextIndex = (currentIndex + 1) % data.length;
    const nextSong = data[nextIndex];
    setOneSong(nextSong);
    setIsPlaying(true);
    updateBackgroundColor(nextSong.id);
  };

  const prevSongHandler = () => {
    if (data.length === 0) return;
    const currentIndex = data.findIndex((song) => song.id === oneSong.id);
    const prevIndex = (currentIndex - 1 + data.length) % data.length;
    const prevSong = data[prevIndex];
    setOneSong(prevSong);
    setIsPlaying(true);
    updateBackgroundColor(prevSong.id);
  };

  const soundToggleHandler = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Filter top tracks (for demonstration, just the 3 songs)
  const topTracks = data.slice(2, 5);

  return (
    <>
      <div className="logo">
        <img src={Logo} alt="Logo" className="logos" />
      </div>
      <div className="music">
        <div className="music-types">
          <h1
            className={`tab ${activeTab === "FOR YOU" ? "active" : ""}`} // changing tab to for you to top track
            onClick={() => handleTabChange("FOR YOU")}
          >
            For You
          </h1>
          <h1
            className={`tab ${activeTab === "TOP TRACK" ? "active" : ""}`}
            onClick={() => handleTabChange("TOP TRACK")}
          >
            Top Track
          </h1>
        </div>

        <div className="music-search">
          <input
            type="text"
            placeholder="Search song, Artist"
            value={search}
            onChange={searchHandler}
          />
          <span>🔍</span>
        </div>

        <div>
          {loader ? (
            <>Loading...</>
          ) : error ? (
            <p>Error occurred while fetching data</p>
          ) : (
            <>
              {activeTab === "FOR YOU"
                ? filteredData.map((each) => (
                    <div
                      className="container"
                      onClick={() => submitHandler(each)}
                      key={each.id}
                    >
                      <div>
                        <img
                          src={`https://cms.samespace.com/assets/${each.cover}`}
                          alt={each.artist}
                        />
                      </div>
                      <div className="names">
                        <span>{each.artist}</span>
                        <span>{each.name}</span>
                      </div>
                      <div className="last">
                        <p>{each.duration}</p>
                      </div>
                    </div>
                  ))
                : topTracks.map((each) => (
                    <div
                      className="container"
                      onClick={() => submitHandler(each)}
                      key={each.id}
                    >
                      <div>
                        <img
                          src={`https://cms.samespace.com/assets/${each.cover}`}
                          alt={each.artist}
                        />
                      </div>
                      <div className="names">
                        <span>{each.artist}</span>
                        <span>{each.name}</span>
                      </div>
                      <div className="last">
                        <p>{each.duration}</p>
                      </div>
                    </div>
                  ))}
            </>
          )}
        </div>
      </div>
      <div className="songs-container">
        <div className="songs-name">
          <h1>{oneSong ? oneSong.artist : "No Song"}</h1>
          <p>{oneSong ? oneSong.name : "Select a song"}</p>
        </div>
        {oneSong && oneSong.cover && (
          <div className="image">
            <img
              src={`https://cms.samespace.com/assets/${oneSong.cover}`}
              alt={oneSong.artist}
            />
            <audio
              ref={audioRef}
              src={oneSong.url}
              id="myAudio"
              autoPlay
            ></audio>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
        <div className="controls">
          <div className="left-side">
            <FaEllipsisH />
          </div>
          <div className="middle">
            <FaStepBackward onClick={prevSongHandler} />
            {isPlaying ? (
              <FaPause onClick={playPauseHandler} />
            ) : (
              <FaPlay onClick={playPauseHandler} />
            )}
            <FaStepForward onClick={nextSongHandler} />
          </div>
          <div className="right-side">
            {isMuted ? (
              <FaVolumeMute onClick={soundToggleHandler} />
            ) : (
              <FaVolumeUp onClick={soundToggleHandler} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HomeComponent;
