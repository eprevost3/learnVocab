import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form';
import { useState, useEffect, ReactNode, KeyboardEvent, ChangeEvent } from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { incrementScore } from '../redux_logic/store.js'
import angFra from '../data/ang-fra.json'
import espFra from '../data/esp-fra.json'
import fraAng from '../data/fra-ang.json'


interface DataType {
    [datasetName: string]: {
        [userName: string]: string[][]
    }
}

const fetchData = () : DataType => {
    // collect the json files containing all data
    const data:  DataType = {'ang-fra': angFra,'esp-fra': espFra,'fra-ang': fraAng,}
    console.log("data", data);

    return data
};


function getRandomNumber(n: number): number {
    // get a random number between 0 and n-1
    return Math.floor(Math.random() * n);
}

// function getTips(word: string): string{
//     // outputs a tip that should help the user guess: if the word is 'hello friends',
//     // the function outputs 'XXXXX XXXXXXX'
//     let n = word.length

//     let tip = ''
//     for (let k = 0; k < n; k++){
//         if (word[k] === ' '){tip += ' '}
//         else{tip += 'X'}
//     }
//     return tip
// }


function getWord(
    user: string, israndom: boolean, dataset: string, counter: number,
): string[]{
    let idx
    let data = fetchData()

    if (israndom){
        // choose the word to guess
        let n = data[dataset][user].length
        idx = getRandomNumber(n)
    }else{
        // case where we want some randomness
        idx = counter
    }

    return data[dataset][user][idx]
}

interface validateGuessProps{
    guess: string,
    answer: string,
    dispatcher: Function,
    updater: Function, // if the word is correctly guessed, reset the guess to ''
}

function validateGuess (
    { guess, answer, dispatcher, updater }: validateGuessProps
): void{
    // check that the word the user entered corresponds to the answer
    if (guess === answer){
        dispatcher(incrementScore())
        updater('')
    }else{
        console.error("wrong")
        console.log("guess:", guess, "answer", answer)
    }
}

interface WordToGuessProps{
    'wordAndDefinition': {[key: string]: string}
}

function WordToGuess({wordAndDefinition}: WordToGuessProps){
    // displays the word the user has to guess
    return(
        <Row className='mt-5'>
            <Col/>
            <Col className='d-flex justify-content-center'>
                <h4>Définition: {wordAndDefinition.toGuess}</h4>
            </Col>
            <Col/>
        </Row>
    )
}

interface InputProps{
    'onKeyDown': (evt: KeyboardEvent) => void,
    'formValue': string,
    'handleInputChange': (event: ChangeEvent<HTMLInputElement>) => void,
}

function Input({onKeyDown, formValue, handleInputChange}: InputProps): ReactNode{
    // outputs the input bar where the user type his guess
    return(
        <Row className='mt-5'>
        <Col/>
        <Col>
            <Form onKeyDown={onKeyDown}>
                <Form.Group className="mb-3">
                    <Form.Control
                    placeholder="mot à deviner"
                    value={formValue}
                    onChange={handleInputChange}
                />
                </Form.Group>
            </Form>
        </Col>
        <Col/>
    </Row>
    )
}

interface PropsButtonValidateGuess{
    'formValue': string, 
    'wordAndDefinition': {[key: string]: string}, 
    'dispatcher': Function, 
    'setFormValue': Function, 
}

function ButtonValidateGuess({
    formValue, wordAndDefinition, dispatcher, setFormValue
}: PropsButtonValidateGuess): ReactNode {
    // button used to validate the guess of the user
    return(
        <Row className='mt-5'>
        <Col/>
        <Col className='d-flex justify-content-center'>
            <Button
                variant="secondary"
                onClick={() => validateGuess({
                    'guess': formValue,
                    'answer': wordAndDefinition.definition,
                    'dispatcher': dispatcher,
                    'updater': setFormValue,
                })}
            >Valider !</Button>
        </Col>
        <Col/>
    </Row>
    )
}

function Guess(): ReactNode {
    // display the word to guess, with the associated definition, provides a place
    // to answer and to submit

    const dispatcher = useDispatch()

    // do we want the words to be displayed in a random order or sequentially?
    interface StateType{
        random: {value: boolean},
        dataset: {value: string},
        score: {value: number},
        user: {value: string},
    }
    const currState: [boolean, string, number, string] = useSelector(
        (state: StateType) => {return([
                state.random.value,
                state.dataset.value,
                state.score.value,
                state.user.value
            ])
        },
        shallowEqual  // Use shallowEqual to perform equality check
    )
    const [ randomStatus, dataset, score, user ] = currState

    // the word to display
    let [wordAndDefinition, setWord] = useState(
        {'toGuess': '', 'definition': ''}
    )
    // what is being typed in the input bar
    let [formValue, setFormValue] = useState('')

    // get the word to guess and its definition
    useEffect(() => {
        const wordAndDef = getWord(user, randomStatus, dataset, score)
        const word = {
            'toGuess': wordAndDef[0], 
            'definition': wordAndDef[1],
        }
        setWord(word)
    // !! The dependency array ensures the effect runs only under certain conditions
    // use this when there are some promises involved
    }, currState)


    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => { 
        setFormValue(event.target.value)
    }

    console.log(randomStatus, dataset, score, user )

    // use the enter key to submit the word
    const onKeyDown =(evt: KeyboardEvent) => {
        if(evt.key === "Enter"){
            // avoid refreshing the page
            evt.preventDefault()

            validateGuess({
                'guess': formValue,
                'answer': wordAndDefinition.definition,
                'dispatcher': dispatcher,
                'updater': setFormValue,
            })}
        else{}
    }

    return(
        <Container fluid>
            <Row className='mt-5 '/>
            
            <WordToGuess wordAndDefinition={wordAndDefinition}/>

            <Input 
                onKeyDown={onKeyDown}
                formValue={formValue}
                handleInputChange={handleInputChange}
            />

            <ButtonValidateGuess 
                formValue={formValue}
                wordAndDefinition={wordAndDefinition}
                dispatcher={dispatcher}
                setFormValue={setFormValue}
            />

        </Container>
    )
}

export default Guess

