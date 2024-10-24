import logo from './logo.svg';
import './App.css';


import Layout from './components/Layout';
import { Routes, Route } from 'react-router-dom';
import CodeEditor from './components/codeeditor/CodeEditor';
import CodeList from './components/codelist/CodeList';


function App() {

  return (
    <div className="App">
      
      <Routes>
        <Route path='/' element={<Layout/>}>
          <Route path='' element={<CodeList/>}/>
          <Route path='code-editor/:id' element={<CodeEditor/>}/>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
