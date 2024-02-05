import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form';
import { useState, useEffect, ReactNode } from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { incrementScore } from '../redux_logic/store'

const fetchData = async (file: string) => {
    // collect the json files containing all data
    let data;

    try {
        const response = await fetch(`./src/data/${file}.json`);
        data = await response.json();

    } catch (error) {
        throw new Error(`Error reading the file: ${error}`);
    }
    return data
};


function getRandomNumber(n: number): number {
    // get a random number between 0 and n-1
    return Math.floor(Math.random() * n);
}

function getTips(word: string): string{
    // outputs a tip that should help the user guess: if the word is 'hello friends',
    // the function outputs 'XXXXX XXXXXXX'
    let n = word.length 

    let tip = ''
    for (let k = 0; k < n; k++){
        if (word[k] === ' '){tip += ' '}
        else{tip += 'X'}
    }
    return tip
}

function getWord(
    user: string, israndom: boolean, dataset: string, counter: number,
){
    let idx
    console.log("dataset", dataset);
    
    let data_of_interest = fetchData(dataset)

    // the data output is a promise
    let word = data_of_interest.then((data) => {
        if (israndom){
            // choose the word to guess
            let n = data[user].length
            idx = getRandomNumber(n)
        }else{
            // case where we want some randomness
            idx = counter
        }

        return data[user][idx]
    })

    return word
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

function Guess(): ReactNode {
    // display the word to guess, with the associated definition, provides a place
    // to answer and to submit

    const dispatcher = useDispatch()

    // do we want the words to be displayed in a random order or sequentially?
    const curr_state = useSelector(
        state => {
            return([
                state.random.value,
                state.dataset.value,
                state.score.value,
                state.user.value
            ])
        },
        shallowEqual  // Use shallowEqual to perform equality check
    )
    const [ randomStatus, dataset, score, user ] = curr_state

    // the word to display
    let [wordAndDefinition, setWord] = useState('')
    // what is being typed in the input bar
    let [formValue, setFormValue] = useState('')

    useEffect(() => {
        getWord(user, randomStatus, dataset, score)
            .then((w) => setWord(w))
    // !! The dependency array ensures the effect runs only under certain conditions
    // use this when there are some promises involved
    }, curr_state)

    const handleInputChange = (event) => { setFormValue(event.target.value)}

    console.log(randomStatus, dataset, score, user )

    // use the enter key to submit the word 
    const onKeyDown =(evt) => {
        if(evt.key === "Enter"){
            // avoid refreshing the page
            evt.preventDefault()

            validateGuess({
                'guess': formValue,
                'answer': wordAndDefinition[1],
                'dispatcher': dispatcher,
                'updater': setFormValue,
            })}
        else{}
    }

    return(
        <Container fluid>
            <Row className='mt-5 '/>
            <Row className='mt-5'>
                <Col/>
                <Col className='d-flex justify-content-center'>
                    <h4>Définition: {wordAndDefinition[0]}</h4>
                </Col>
                <Col/>
            </Row>
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


            <Row className='mt-5'>
                <Col/>
                <Col className='d-flex justify-content-center'>
                    <Button
                        variant="secondary"
                        onClick={() => validateGuess({
                            'guess': formValue,
                            'answer': wordAndDefinition[1],
                            'dispatcher': dispatcher,
                            'updater': setFormValue,
                        })}
                    >Valider !</Button>
                </Col>
                <Col/>
            </Row>

        </Container>
    )
}

export default Guess

