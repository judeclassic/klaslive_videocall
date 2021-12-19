import './App.css';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PhoneIcon from '@material-ui/icons/Phone';
import { CopyToClipboard} from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import React, {useEffect, useRef, useState} from 'react';

const socket = io.connect('https://klasserver.herokuapp.com');

function App() {
  const [me, setMe]  = useState("");
  const [stream, setStream] = useState();
  const [recievingCall, setRecievingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
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

    socket.on('callUser', (data)=>{
      setRecievingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });


  }, [])

  const callUser = (id)=>{
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signal: data,
        from: me,
        name: name,
      })
    });

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on('callAccepted', (signal)=>{
      setCallAccepted(true);
      peer.signal(signal);
    })

    connectionRef.current = peer;
  }

  const answerCall = ()=>{
    setCallAccepted(true);
    setRecievingCall(false);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data)=>{
      console.log('working now')
      socket.emit('answerCall', {signal: data, to: caller});
    });

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  }



  const leaveCall = ()=> {
    setCallEnded(true);
    connectionRef.current.destroy();
    console.log('call exited');
  }

  return (
    <div className="App">
      <div className='container'>
        <div className='video'>
          {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
        </div>
        <div className='video'>
          {callAccepted && !callEnded ?
            <video playsInline muted ref={userVideo} autoPlay style={{ width: "300px" }} />:
            null
          }
        </div>
        <div>
          <TextField
            id='fill-basic'
            label='Name'
            variant='filled'
            value={name}
            onChange= {(data) => setName(data.target.value)}
            style={{marginBottom: "20px"}}>
            
            </TextField>
        </div>
        <div>
          <CopyToClipboard text={me} style={{margin: 'Zitem'}} >
            <Button variant='contained' color='secondary' startIcon={<AssignmentIcon fontSize='large' />}>
              CopyId
            </Button>
          </CopyToClipboard>
        </div>
        <TextField
          id='fill-basic'
          label='Id To Call'
          variant='filled'
          value={idToCall}
          onChange= {(data) => setIdToCall(data.target.value)}
          style={{marginBottom: "20px"}}
        >

        </TextField>
        {callAccepted && !callEnded ?
          <div>
            <Button variant='contained' color='secondary' onClick={leaveCall}>Leave Call</Button>
          </div>
          :
          <div>
            <IconButton color='primary' aria-label='call' onClick={()=> callUser(idToCall)}>
              <PhoneIcon fontSize='large' />
            </IconButton>
            {idToCall}
          </div>
        }
      </div>

      {recievingCall ?
        <div>
          <div><h1>{name} is calling you</h1></div>
          <Button variant='contained' color='primary' onClick={answerCall}>Answer</Button>
        </div>
        :
        null

      }
      
    </div>
  );
}

export default App;
