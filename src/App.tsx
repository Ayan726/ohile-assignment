import { useEffect, useRef, useState } from "react";
import "./App.css";
import { FaCirclePause } from "react-icons/fa6";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { MdAudioFile } from "react-icons/md";

const mimeType: string = "audio/webm";
interface Message {
  msg: string | null;
  isAudio: boolean;
  isUser: boolean;
}

function App() {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<"inactive" | "active">(
    "inactive"
  );
  const [audioChunks, setAudioChunks] = useState<Blob[] | []>([]);
  const [audio, setAudio] = useState<string | null>(null);
  const [permission, setPermission] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [inp, setInp] = useState<string>("");
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      playAudio();
    }, 1000);

    () => clearTimeout(timeOut);
  }, [messages]);

  const playAudio = () => {
    const audioElement = document.getElementById("myAudio");
    if (audioElement && audioElement instanceof HTMLAudioElement) {
      audioElement.play();
    }
  };

  const startRecording = async () => {
    setRecordingStatus("active");
    if (!stream) return;
    const media = new MediaRecorder(stream, { mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start();
    let localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (e) => {
      if (typeof e.data === "undefined") return;
      if (e.data.size === 0) return;
      localAudioChunks.push(e.data);
    };
    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    setRecordingStatus("inactive");
    if (!mediaRecorder.current) return;
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioUrl);
      setAudioChunks([]);
    };
  };
  const getMicPermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert("something went wrong!!");
    }
  };

  const scrollToBottom = () => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop =
        scrollableContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="chat">
      <div className="chat-title">
        <h1>Meow Bot</h1>
        <h2>Online</h2>
        <figure className="avatar">
          <img
            src="https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?q=80&w=1377&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Profile"
          />
        </figure>
      </div>
      <div className="messages">
        <div ref={scrollableContainerRef} className="messages-content">
          {messages.map((message, ind) => {
            return (
              <div
                key={ind}
                className={`${
                  message.isUser ? "container-personal" : "container-bot"
                }`}
              >
                {message.isAudio && message.msg ? (
                  <audio
                    id={`${ind === messages.length - 1 ? "myAudio" : ""}`}
                    className={`${
                      message.isUser ? "message-personal" : "new"
                    } message`}
                    src={message.msg}
                    controls
                  />
                ) : (
                  <div
                    className={`${
                      message.isUser ? "message-personal" : "new"
                    } message`}
                  >
                    <span>{message.msg}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="message-box">
        {audio && (
          <div className="audio-file-container">
            <MdAudioFile className="file-icon" />
            <p>Send your audio</p>
          </div>
        )}
        <textarea
          value={inp}
          onChange={(e) => {
            setInp(e.target.value);
          }}
          typeof="text"
          className="message-input"
          placeholder="Type message..."
        ></textarea>
        {!permission && (
          <IoMdMicOff onClick={getMicPermission} className="mic-icon" />
        )}

        {permission && recordingStatus === "inactive" && (
          <IoMdMic onClick={startRecording} className="mic-icon" />
        )}

        {permission && recordingStatus === "active" && (
          <FaCirclePause onClick={stopRecording} className="mic-icon" />
        )}

        <button
          onClick={(e) => {
            if (!inp && !audio) return;
            e.preventDefault();
            let ifInp: string = "";
            if (inp) {
              ifInp = inp;
              setMessages((prev) => [
                ...prev,
                { msg: inp, isAudio: false, isUser: true },
              ]);
            }
            if (audio) {
              setMessages((prev) => [
                ...prev,
                { msg: audio, isAudio: true, isUser: true },
              ]);
            }
            setInp("");
            setAudio(null);
            setTimeout(scrollToBottom, 100);
            setTimeout(() => {
              if (ifInp)
                setMessages((prev) => [
                  ...prev,
                  { msg: ifInp, isAudio: false, isUser: false },
                ]);
            }, 1200);
          }}
          type="submit"
          className="message-submit"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
