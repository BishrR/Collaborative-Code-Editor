// import { Outlet } from "react-router-dom";

// import React from "react";

// const Layout = () => {
//     return (
//         <main>
//             <div style={{ backgroundColor: 'red', height: 100 }}></div>
//             <div style={{ flexDirection: 'row', display:'flex' }}>
//                 <div style={{ backgroundColor: 'blue', flex: 1, height: 100 }}></div>
//                 <div style={{ flex: 3, backgroundColor: 'yellow' }}>
//                     <Outlet />
//                 </div>
//                 <div style={{ flex: 1, backgroundColor: 'black' }}>
//                     <Outlet />
//                 </div>
//             </div>

//         </main>
//     )
// }

// export default Layout
import React from 'react';
import CodeList from './codelist/CodeList'; // Component for displaying the list of codes
import CodeEditor from './codeeditor/CodeEditor';     // Component for the code editor
import Console from './codeeditor/Console';   // Component for the console output
import './Layout.css';             // Import custom styles

const Layout = () => {
    return (
        <div className="layout">
            {/* Header */}
            <header className="header">
                <h1>Code Editor</h1>
            </header>

            {/* Main content: Sidebar (left), Editor (right)*/}
            <div className="main-content">
                {/* Left sidebar: Code List */}
                <aside className="sidebar-left">
                    <CodeList />
                </aside>

                {/* Middle section: Editor */}
                <section className="editor-section">
                    <CodeEditor />
                </section>
            </div>
        </div>
    );
};

export default Layout;
