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
  const [stream, setStream] = useState();
  const [recievingCall, setRecievingCall] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");

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

  }, []);

  const connect = (id)=>{
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      socket.emit('enterClass', {
        userToCall: id,
        signal: data,
        from: me,
        name: name,
      })
    });

    peer.on('stream', (stream) => {
      currentUserVideo.current.srcObject = stream;
      userVideos.push(currentUserVideo)
    });

    socket.on('callAccepted', (signal)=>{
      setCallAccepted(true);
      peer.signal(signal);
    })

    connectionRef.current = peer;
  }

  const leaveCall = ()=> {
    setCallEnded(true);
    connectionRef.current.destroy();
    console.log('call exited');
  }

  if (recievingCall){
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
  
          <TextField
            id='filled-basic'
            label='Name'
            variant='filled'
            value={name}
            onChange= {(data)=> setName(data.target.value)}
            style={{ marginBottom: '20px', marginLeft: '20px'}}
          />
  
          <Button
            variant='outlined'
            color='primary'
            onClick={connect(me)}
            style={{ marginBottom: '0px', marginLeft: '20px'}}
          >
            Start Class
          </Button>

        </div>
  
        <div class="main">
          <div class="row">
             {userVideos.map((userVideo)=>
              <div class="column">
                  
                  <video
                      playsInline
                      autoPlay muted
                      ref={userVideo}
                      style={{width: "380px", height: "350px", marginLeft: '10px'}}
                  />
                  
              </div>
             )}
          </div>
        </div>
        
      </div>
    );
  }else{
    return (
      <div className="App">
        <div class="main" style={{marginLeft: '25%'}}>
          <div>
            <video
                playsInline
                autoPlay muted
                ref={myVideo}
                style={{width: "380px", height: "350px"}}
            />

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
          <TextField
            id='fill-basic'
            label='Class ID'
            variant='filled'
            value={idToCall}
            onChange= {(data) => setIdToCall(data.target.value)}
            style={{marginBottom: "20px", marginLeft: '20px'}}
          >

          </TextField>
          </div>

          <div>
            <Button
              variant='outlined'
              color='primary'
              onClick={connect}
              style={{ marginBottom: '0px', marginLeft: '20px'}}
            >
              Start Class
            </Button>
          </div>


        </div>
        
      </div>
    );
  }
}

export default App;
