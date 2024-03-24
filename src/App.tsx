import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import ClientTab from './components/ClientTab'
import Params from './components/Params'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useSelector } from 'react-redux'

function App() {
    useSelector(state => console.log('state', state))

    return (
    <div className="app mt-1 h-100">
        <Row className='h-100'>
            <Col>
                <Params/>
            </Col>
            <Col xs={9}><ClientTab/></Col>
        </Row>
    </div>
)}

export default App


// nettoyer le code 
// ajouter des mots 
