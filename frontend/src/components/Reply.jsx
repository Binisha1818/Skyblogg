import { useState } from "react";
import axios from "axios";

const Reply = ({ commentId }) => {

  const [reply, setReply] = useState("");

  const submitReply = async () => {

    try {

      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/comments/${commentId}/replies`,
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