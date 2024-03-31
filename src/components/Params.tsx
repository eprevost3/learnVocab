import Stack from 'react-bootstrap/Stack'
import Form from 'react-bootstrap/Form'
import { ReactNode } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleRandom, changeDataset } from '../redux_logic/store'

function Score(): ReactNode{
    let score = useSelector((state: {score: {value: number}}) => state.score.value)
    return(<h3>Score: {score}</h3>)
}

function Random(): ReactNode{
    const dispatcher = useDispatch()
    return(
        <Form>
            <Form.Check // prettier-ignore
                type="switch"
                id="custom-switch"
                label="Aléatoire ?"
                defaultChecked
                onClick={() => dispatcher(toggleRandom())}
            />
        </Form>
    )
}


function Data(): ReactNode {
    const dispatcher = useDispatch()
    const switchDataset = (evt: string) => dispatcher(changeDataset(evt))
    return (
        <>
            <p>Quelles données ? </p>
            <Form.Select onChange={(e) => {switchDataset(e.target.value)}}>
                <option value="fra-ang">{"Francais -> Anglais"}</option>
                <option value="ang-fra">{"Anglais -> Francais"}</option>
                <option value="esp-fra">{'Espagnol -> Francais'}</option>
                <option value="fra-esp">{'Francais -> Espagnol'}</option>
            </Form.Select>
      </>
    );
  }


function Params(): ReactNode {
    return(
        <Stack gap={5} className='pt-5 border-end h-100'>
            <div className='ps-3'/>
            <div className='ps-3 border-bottom'><Score/></div>
            <div className='ps-3 border-bottom'><h3>Paramètres:</h3></div>
            <div className='ps-3'><Random/></div>
            <div className='ps-3 pe-3'><Data/></div>
        </Stack>
    )
}

export default Params