import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { ReactNode } from 'react'
import { changeUser } from '../redux_logic/store.ts'
import { useDispatch } from 'react-redux'
import Guess from './Guess'

function ClientTab(): ReactNode {
    const dispatcher = useDispatch()
    
    // things to change when going to a different tab
    const handleTabSelect = (selectedTab: string | null) => {
        dispatcher(changeUser(selectedTab))
    }
    return (
        <Tabs
            defaultActiveKey="Pupuce"
            id="justify-tab-example"
            className="mb-3"
            variant="pills"
            onSelect={handleTabSelect}
            justify
        >
            <Tab eventKey="Boudinet" title="Boudinet" >
                <Guess/>
            </Tab>        
            <Tab eventKey="Pupuce" title="Pupuce">
                <Guess/>
            </Tab>
            <Tab eventKey="Titou" title="Titou">
                <Guess/>
            </Tab>
        </Tabs>
    );
}


export default ClientTab;