import '../App.css';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PhoneIcon from '@material-ui/icons/Phone';
import { CopyToClipboard} from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import React, {useEffect, useRef, useState} from 'react';

// const socket = io.connect('https://klasserver.herokuapp.com');
const socket = io.connect('http://localhost:5000');

function App() {
  const [me, setMe]  = useState("");
  const [stream, setStream] = useState([]);
  const [classStarted, setClassStarted] = useState(false);
  const [caller, setCaller] = useState([]);
  const [callerSignal, setCallerSignal] = useState();
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState([]);

  const myVideo = useRef();
  const currentUserVideo = useRef();
  const userVideos = [ myVideo, myVideo, myVideo];
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream)=>{
      setStream(stream);
      myVideo.current.srcObject = stream;
      setStream(stream);
    });

    socket.on('me', (id)=>{
      setMe(id);
    });

  }, [])

  const create = ()=>{
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    setClassStarted(true);

    socket.on('enterClass', (signal)=>{
      peer.signal(signal);
    });

    peer.on('stream', (stream) => {
      currentUserVideo.current.srcObject = stream;
      userVideos.push(currentUserVideo)
    });

    peer.on('signal', (data)=>{
      console.log('working now')
      socket.emit('answerCall', {signal: data, to: caller});
    });

    peer.on('stream', (stream) => {
      currentUserVideo.current.srcObject = stream;
      userVideos.push(currentUserVideo)
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  }



  const leaveClass = ()=> {
    setCallEnded(true);
    connectionRef.current.destroy();
    console.log('call exited');
  }

  return (
    <div className="App">
      <div class="sidenav">
        <div className='video-container'>
          {stream && 
            <video
              playsInline
              autoPlay muted
              ref={myVideo}
              style={{width: "380px", height: "350px",overflow: 'hidden', marginLeft: '10px', borderRadius: '20px'}}
            />
          }
        </div>

        <div>
          <TextField
            id='filled-basic'
            label='Name'
            variant='filled'
            value={name}
            onChange= {(data)=> setName(data.target.value)}
            style={{ marginBottom: '20px', marginLeft: '20px'}}
          />
        </div>

        <div>
          <CopyToClipboard text={me} style={{margin: 'Zitem', marginLeft: '20px',  marginBottom: '20px'}} >
            <Button variant='contained' color='secondary' startIcon={<AssignmentIcon fontSize='large' />}>
              CopyId
            </Button>
          </CopyToClipboard>
        </div>

        {!classStarted ?
          <div>
            <Button
              variant='outlined'
              color='primary'
              onClick={create}
              style={{ marginBottom: '20px', marginLeft: '20px'}}
            >
              Start Class
            </Button>
          </div>
          :
          <div>
            <Button
              variant='outlined'
              color='secondary'
              onClick={leaveClass}
              style={{ marginBottom: '20px', marginLeft: '20px'}}
            >
              End Class
            </Button>
          </div>
        }

      </div>

      <div class="main">
        <div class="row">
           {userVideos.map((userVideo)=>
            <div class="column">
                
                {/* <video
                    playsInline
                    autoPlay muted
                    ref={userVideo}
                    style={{width: "380px", height: "350px", marginLeft: '10px'}}
                /> */}
                
            </div>
           )}
        </div>
      </div>
      
    </div>
  );
}

export default App;
