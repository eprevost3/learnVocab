import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import { 
    useState, useEffect, useRef, ReactNode, KeyboardEvent, ChangeEvent 
} from 'react'
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
    'guess': string,
    'answer': string,
    'dispatcher': Function,
    'updater': Function, // if the word is correctly guessed, reset the guess to ''
    'setShowAnswer': Function, // if the word is guess correctly, then we 
        // need to clear the help pop-up
}

function validateGuess (
    { guess, answer, dispatcher, updater, setShowAnswer }: validateGuessProps
): void{
    console.log("hello", setShowAnswer);
    
    // check that the word the user entered corresponds to the answer
    if (guess === answer){
        // stop displaying the answer 
        setShowAnswer(false)

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
    'setShowAnswer': Function,
}

function ButtonValidateGuess({
    formValue, wordAndDefinition, dispatcher, setFormValue, setShowAnswer
}: PropsButtonValidateGuess): ReactNode {
    // button used to validate the guess of the user
    
    return(
        <Button
            variant="success"
            className='me-4'
            onClick={() => validateGuess({
                'guess': formValue,
                'answer': wordAndDefinition.definition,
                'dispatcher': dispatcher,
                'updater': setFormValue,
                'setShowAnswer': setShowAnswer,
            })}
        >
            Valider !
        </Button>

    )
}

interface ShowAnswerProps{
    'showAnswer': boolean,
    'setShowAnswer': Function,
    'definition': string,
    'answer': string,
}

function ShowAnswer(
    // show an alert that provides the answer to the question
    {showAnswer, setShowAnswer, definition, answer}: ShowAnswerProps): ReactNode{
    return(
        <Alert 
            show={showAnswer} 
            variant="danger" 
            onClose={() => setShowAnswer(false)} 
            dismissible
        >
            La définition de {definition} est : {answer}
        </Alert>
    )
}


interface PropsButtons{
    'formValue': string, 
    'wordAndDefinition': {[key: string]: string}, 
    'dispatcher': Function, 
    'setFormValue': Function, 
    'setShowAnswer': Function,
    'showAnswer': boolean, 
}

function Buttons({
    formValue, wordAndDefinition, dispatcher, setFormValue, showAnswer, setShowAnswer, 
}: PropsButtons): ReactNode{
    return(
        <>
            <Row className='mt-5'>
                <Col/>
                <Col className='d-flex justify-content-center'>
                    <ButtonValidateGuess 
                        formValue={formValue}
                        wordAndDefinition={wordAndDefinition}
                        dispatcher={dispatcher}
                        setFormValue={setFormValue}
                        setShowAnswer={setShowAnswer}
                    />

                    <Button 
                        variant="danger" 
                        className='ms-4'
                        onClick={() => setShowAnswer(true)}
                    >
                        Je ne sais pas !
                    </Button>
                </Col>
                <Col/>
            </Row>
            <Row className='mt-5'>
                <Col/>

                <Col>
                    <ShowAnswer 
                        showAnswer={showAnswer}
                        setShowAnswer={setShowAnswer}
                        definition={wordAndDefinition.toGuess} 
                        answer={wordAndDefinition.definition}
                    />
                </Col>
                <Col/>
            </Row>
        </>
    )
}

interface PropsInputWithHint{
    'nbLetters': number,
}

// TODO:
// gérer les espaces, gérer le nombre de lettres (ca marche plus à 19)
// récupérer la valeur du mot
function InputWithHint({nbLetters}: PropsInputWithHint): ReactNode{
    // several inputs aggregated together. Each input can only contain one letter
    // this makes it easier to guess the word
    const listRef: React.MutableRefObject<HTMLInputElement>[] = 
        Array(nbLetters).fill(null).map((elt) => useRef(elt))

    // the cell where we should type the letter
    let activeCell = 0

    const handleFocus = () => {listRef[activeCell].current.focus()}
    const handleChange = (evt: KeyboardEvent) => {
        if((evt.key === "Backspace") || (evt.key === "Delete")){
            // case where we a deletion
            activeCell = Math.max(0, activeCell - 1)
            // careful with the order of the focus
            handleFocus()
        }else if((evt.key === ' ') || (evt.key === 'Enter')){
            // do nothing and erase what's in the cell
            listRef[activeCell].current.value = ''   
        }else{
            // increment the counter and move to next cell
            activeCell = Math.min(activeCell + 1, nbLetters - 1)
            handleFocus()
        }   
    }

    return(
        <div className='d-flex justify-content-center'>
            {listRef.map(
                (r, idx) => <input 
                    className='fw-bold text-center m-1'
                    key={idx} 
                    size={1}
                    ref={r} 
                    maxLength={1}
                    onFocus={handleFocus}
                    onKeyUp={(evt) => handleChange(evt)}
            />)
            }
        </div>
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

    // do we show the answer card?
    let [showAnswer, setShowAnswer] = useState(false)

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
                'setShowAnswer': setShowAnswer,
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

            <InputWithHint nbLetters={18}/>

            <Buttons 
                formValue={formValue}
                wordAndDefinition={wordAndDefinition}
                dispatcher={dispatcher}
                setFormValue={setFormValue}
                showAnswer={showAnswer}
                setShowAnswer={setShowAnswer}
            />
        </Container>
    )
}

export default Guess

