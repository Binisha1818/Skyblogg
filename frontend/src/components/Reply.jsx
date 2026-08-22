import { useState } from "react";
import axios from "axios";

const API_URL = "https://sky-dlae.onrender.com";

const Reply = ({ commentId }) => {

  const [reply, setReply] = useState("");

  const submitReply = async () => {

    try {

      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/comments/${commentId}/replies`,
        {
          content: reply
        },
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );


      setReply("");

      alert("Reply added");

    } catch(error){
      console.log(error);
    }

  };


  return (
    <div className="reply-box">

      <input
        type="text"
        placeholder="Write a reply..."
        value={reply}
        onChange={(e)=>setReply(e.target.value)}
      />


      <button onClick={submitReply}>
        Reply
      </button>


    </div>
  )
}


export default Reply;
