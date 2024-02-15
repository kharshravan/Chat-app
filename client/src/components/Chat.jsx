
import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import io from 'socket.io-client';
import Sidebar from './Sidebar';
import '../App.css';
import UserContext from '../helper/UserContext';

const socket = io("http://localhost:3000/");

const Chat = () => {
    const [messages, setMessages] = useState([]);
    // const [users, setUsers] = useState([]);
    const { user } = useContext(UserContext);
    const username = user.username;
    const room = user.room;
    const [message, setMessage] = useState('');
    
    const [roomData, setRoomData] = useState({ room: '', users: [] });

    useEffect(() => {
        console.log('Component rendered or dependency changed.');
        let isMounted = true;
        if (!username || !room) {
            // If username or room is not defined, return early
            console.log('Username or room is missing. Returning early.');
            return;
        
        }
        
        socket.connect();
        console.log('Registering event listeners...');
    
        // Join the chat room when the component mounts
        socket.emit('join', { username, room }, (error) => {
            if (error) {
                console.error('Error joining room:', error);
                alert(error);
                window.location.href = '/';
            }
        });
    
        console.log('Registering message event listener...');
        // Listen for incoming messages
        socket.on('message', (message) => {
            console.log('Received message:', message);
            if (!messages.some(msg => msg.createdAt === message.createdAt && msg.text === message.text)) {
                // If the message is not a duplicate, update the state
                setMessages((prevMessages) => [...prevMessages, message]); // Update messages state
                autoscroll();
            } else {
                console.log('Duplicate message ignored:', message);
            }
        });
    
        // Listen for location messages
        console.log('Registering locationMessage event listener...');
        socket.on('locationMessage', (message) => {
            console.log('Received location message:', message);
            setMessages((prevMessages) => [...prevMessages, message]);
            autoscroll();
        }); 
    
        // Listen for room data updates
        console.log('Registering roomData event listener...');
        socket.on('roomData', ({ users }) => {
            console.log('Received room data:', { room, users });
            console.log(users); // Check if users are received properly
            setRoomData({ room, users }); // Update the state with the list of users
        });
    
        // Cleanup function to disconnect socket when component unmounts
        return () => {
            console.log('Disconnecting socket.');
            try {
                if (isMounted) {
                    socket.disconnect();
                    isMounted = false;
                }
            } catch (error) {
                console.error('Error disconnecting socket:', error);
            }
        };
    }, [username, room]);
    

    const autoscroll = () => {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!username || !room) {
            // If username or room is not defined, return early
            return;
        }
        
        if (message.trim()) {
            socket.emit('sendMessage', message, (error) => {
                if (error) {
                    console.log(error);
                    alert('Message not delivered!');
                } else {
                    console.log('Message delivered!');
                    setMessage('');
                }
            });
        }
    };

    const sendLocation = () => {
        if (!username || !room) {
            // If username or room is not defined, return early
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                socket.emit('sendLocation', { latitude, longitude }, () => {
                    console.log('Location shared!');
                });
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    return (
        <div className="chat">
            <div id="sidebar" className="chat__sidebar">
            <h2 className="room-title">{roomData.room}</h2>
            <h3 className="list-title">Users</h3>
            <ul className="users">
                {roomData.users.map((user, index) => (
                    <li key={index}>{user.username}</li>
                ))}
            </ul>
        </div>
            <div className="chat__main">
                <div id="messages" className="chat__messages">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            <p>
                                <span className="message__name">{msg.username}</span>
                                <span className="message__meta">
                                    {moment(msg.createdAt).format('h:mm a')}
                                </span>
                            </p>
                            {msg.text && <p>{msg.text}</p>}
                            {msg.url && (
                                <p>
                                    <a href={msg.url} target="_blank" rel="noopener noreferrer">
                                        My current location
                                    </a>
                                </p>
                            )}
                        </div>
                    ))}
                </div>
                <div className="compose">
                    <form id="message-form" onSubmit={sendMessage}>
                        <input
                            type="text"
                            name="message"
                            placeholder="Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            autoComplete="off"
                        />
                        <button type="submit">Send</button>
                    </form>
                    <button id="send-location" onClick={sendLocation}>
                        Send location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
