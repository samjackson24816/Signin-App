import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import styled from 'styled-components';

const supabase = createClient("https://ypwscwtwlivwwnbjddvh.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd3Njd3R3bGl2d3duYmpkZHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwODkyMjMsImV4cCI6MjA1MDY2NTIyM30.8L5f9QNewWhAZDVouKPonLYCfrAB4ZdLLMT9NE59-uY");


function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);


  async function getUsers() {
    const { data } = await supabase.from('users').select().order('name', { ascending: true });
    setUsers(data);
  }


  async function getIdFromAlias(alias) {
    const { data } = await supabase.from('aliases').select().eq('alias', alias);

    // Aliases are unique, so there will only be one element
    if (data[0] == undefined) {
      return undefined;
    }
    else { return data[0].id }
  }

  async function getUserName(id) {
    const { data } = await supabase.from('users').select().eq('id', id);
    // There must be a name for the user
    return data[0].name;
  }

  async function getUserStatus(id) {
    const { data } = await supabase.from('users').select('signed_in').eq('id', id);

    return data[0].signed_in;
  }

  async function logUser(id, currentlySignedIn) {
    await supabase.from('records').insert({ id: id, signed_in: !currentlySignedIn });
  }


  const [input, setInput] = useState("");

  async function handleInput(userInput) {

    console.log(userInput);

    const id = await getIdFromAlias(userInput);

    setInput("");
    if (id == undefined) {
      console.log("Invalid username");
      return;
    }

    processId(id);
  }

  async function processId(id) {
    const name = await getUserName(id);
    console.log("Hello " + name);
    const signed_in = await getUserStatus(id);

    console.log(signed_in ? "You are now signed out" : "You are now signed in");

    await logUser(id, signed_in);

    await getUsers();
  }


  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        console.log(event.key)
        handleInput(input);
      } else {
        setInput(input + event.key);
      }
    };

    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  });

  return (
    <div>
      <p>Input: {input}</p>

      <div >

        <ul className="user-list" style={{ listStyleType: 'none' }}>
          {users.map((user) => (
            <li key={user.id} className="user" onClick={() => processId(user.id)}>
              {user.signed_in ?
                <div className="user-signed-in">
                  <div className="user-name">{user.name}</div><div className="user-label">IN</div>
                </div> :
                <div className="user-signed-out">
                  <div className="user-name">{user.name}</div><div className="user-label">OUT</div>
                </div>
              }
            </li>
          ))
          }
        </ul >
      </div>
    </div>
  );
}

export default App;

