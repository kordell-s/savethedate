import { useRef, useState } from "react";
import "./guest.css";

const MEDIA = "/media/invitation-v1";

// Guest playback uses the finished film, avoiding live 3D/filter layers on phones.
export default function GuestInvitation() {
  const video = useRef(null);
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [still, setStill] = useState(false);

  const showStill = () => {
    video.current?.pause();
    setStill(true);
    setEntered(true);
    setLoading(false);
  };

  const play = () => {
    const player = video.current;
    if (!player) return;
    setLoading(true);
    setEnded(false);
    player.currentTime = 0;
    // Keep play() inside the tap handler so Safari permits sound.
    try {
      const pending = player.play();
      pending?.catch(showStill);
    } catch {
      showStill();
    }
  };

  return <main className="guest-invitation">
    {still ? <img className="guest-film" src={`${MEDIA}-final.jpg`}
      alt="Gabriella and Kordell — Save the date, 27 July 2027, Anguilla. Invitations to follow." /> :
      <video ref={video} className="guest-film" playsInline preload="metadata"
        poster={`${MEDIA}-opening.jpg`} src={`${MEDIA}.mp4`} muted={muted}
        aria-label="Gabriella and Kordell's save the date: 27 July 2027, Anguilla. Invitations to follow."
        onPlaying={() => { setEntered(true); setLoading(false); }}
        onWaiting={() => setLoading(true)}
        onEnded={() => { setEnded(true); setLoading(false); }}
        onError={showStill} />}

    {!entered && <section className="guest-enter" aria-label="Open the invitation">
      <h1>Our Forever</h1>
      <button className="guest-open" onClick={play} disabled={loading}>
        {loading ? "Opening…" : "Open"}
      </button>
      {loading && <button className="guest-still-link" onClick={showStill}>View save the date</button>}
    </section>}

    {entered && !still && <>
      {!ended && <button className="guest-control guest-sound" aria-pressed={muted}
        onClick={() => setMuted(value => !value)}>{muted ? "Sound off" : "Sound on"}</button>}
      {loading && <div className="guest-buffer" role="status">Loading the invitation…
        <button className="guest-still-link" onClick={showStill}>View save the date</button>
      </div>}
      {ended && <button className="guest-control guest-replay" onClick={play}>Replay</button>}
    </>}
    {still && <a className="guest-control guest-replay" href={`${MEDIA}.mp4`}>Watch video</a>}
  </main>;
}
