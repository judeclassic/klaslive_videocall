import '../App.css';
import React, { useEffect, useRef, useState } from "react";
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PhoneIcon from '@material-ui/icons/Phone';
import { CopyToClipboard} from 'react-copy-to-clipboard';
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}


// const videoConstraints = {
//     height: window.innerHeight / 2,
//     width: window.innerWidth / 2
// };

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const [names, setNames] = useState([]);
    const [name, setName] = useState('')
    const roomID = 'roomID';

    useEffect(() => {
        socketRef.current = io.connect("http://localhost:8000");
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    return (

        <div className="App">
            <div class="sidenav">
                <div className='video-container'>
                {
                    <video
                    playsInline
                    autoPlay
                    muted
                    ref={userVideo}
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
                {/* <CopyToClipboard text={me} style={{margin: 'Zitem', marginLeft: '20px',  marginBottom: '20px'}} >
                    <Button variant='contained' color='secondary' startIcon={<AssignmentIcon fontSize='large' />}>
                    CopyId
                    </Button>
                </CopyToClipboard> */}
                </div>

                {/* {!classStarted ?
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
                } */}

            </div>

            <div class="main">
            <Container>
                {/* <StyledVideo muted ref={userVideo} autoPlay playsInline /> */}
                {peers.map((peer, index) => {
                    return (
                        <Video playsInline muted key={index} peer={peer} />
                    );
                })}
            </Container>
            </div>
            
        </div>
    );
};

export default Room;