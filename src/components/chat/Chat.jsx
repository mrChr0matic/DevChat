import { useEffect, useRef, useState } from "react";
import "./chat.css"
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import {db} from "../../lib/firebase"
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () =>{
    const [open,setOpen]=useState(false);
    const [chat,setChat]=useState([]);
    const [text,setText]=useState("");
    const [img,setImg]=useState({
        file:null,
        url:"",
    })

    const {chatId,user,isCurrentUserBlocked,isReceiverBlocked}= useChatStore();
    const {currentUser}= useUserStore();

    const endRef=useRef(null);

    useEffect(()=>{
        endRef.current?.scrollIntoView({behavior:"smooth"}) 
    },[])

    useEffect(()=>{
        const unSub=onSnapshot(doc(db,"chats",chatId),(res)=>{
            setChat(res.data())
            console.log(chat , "are the chats");
        });

        return ()=>{
            console.log(chat.messages)
            unSub();
        }
    },[chatId])

    useEffect(() => {
        console.log("Current User:", currentUser);
        console.log("User:", user);
    }, [currentUser, user]);
    


    const handleClick= ()=>{
        setOpen(!open);
    }

    const handleImg = (e)=>{
        if(e.target.files){
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleEmoji = e =>{
         setText(prev=>prev+e.emoji);
         setOpen(false)
    }

    const handleSend = async ()=>{
        if(text==="") return;

        let imgUrl=null;
        try{

            if(img.file){
                imgUrl=await upload(img.file);
            }
            await updateDoc(doc(db,"chats",chatId),{
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && {img:imgUrl}),
                }) 
            })

            const userIds=[currentUser.id,user.id];

            userIds.forEach(async (id)=>{
                const userChatsRef= doc(db,"userChats",id);
                console.log(id,"is the ids");
                const userChatsSnapshot= await getDoc(userChatsRef);
    
                if(userChatsSnapshot.exists()){
                    const userChatsData=userChatsSnapshot.data();
                    const chatIndex=userChatsData.chats.findIndex(c=>c.chatId===chatId);
    
                    userChatsData.chats[chatIndex].lastMessage=text;
                    console.log(userChatsData.chats[chatIndex].lastMessage);
                    userChatsData.chats[chatIndex].isSeen= (id===currentUser.id)?true:false;
                    userChatsData.chats[chatIndex].updatedAt=Date.now();
    
                    await updateDoc(userChatsRef,{
                        chats: userChatsData.chats,
                    })
                }
            })

        }
        catch(err){
            console.log(err);
        }

        setImg({
            file:null,
            url:"",
        })
        setText("");
        console.log(text);
    }

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username ? user?.username:"DevChat User"}</span>
                        <p>{user?.username ? "this is my about":"About User"}</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
            {
                chat?.messages?.map((message)=>(
                <div className={message.senderId===currentUser?.id? "message own":"message"} key={message.createdAt}>
                    <div className="texts">
                        {   message.img &&                  
                            <img src={message.img} alt="" />
                        }
                        <p>{message.text}</p>
                        {/* <span>1 minute ago</span> */}
                    </div>
                </div>
            ))}   

            {img.url && (
                <div className="message own">
                    <div className="texts">
                        <img src={img.url} alt="" />
                    </div>
                </div>
            )}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="./img.png" alt="" />
                    </label>
                    <input type="file" id="file" style={{display:"none"}} onChange={handleImg}/>
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" />
                </div>
                <input type="text" name="" 
                    placeholder= {(isCurrentUserBlocked||isReceiverBlocked) ? "Blocked":"Type a message"}  id="" 
                    onChange={(e)=>setText(e.target.value)}
                    value={text}
                    disabled={isCurrentUserBlocked||isReceiverBlocked}
                />
                <div className="emoji">
                    <img src="./emoji.png" alt="" onClick={handleClick} />
                    <EmojiPicker open={open} onEmojiClick={handleEmoji} className="picker"/>
                </div>
                <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked||isReceiverBlocked}>Send</button>
            </div>
        </div>
    )
}

export default Chat;