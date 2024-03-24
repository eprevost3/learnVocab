import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert';
import Fade from 'react-bootstrap/Fade'
import { 
    useState, useRef, ReactNode, KeyboardEvent, useEffect 
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

const fetchData = (): DataType => {
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
    'guess': string[],
    'answer': string,
    'dispatcher': Function,
    'setShowAnswer': Function, // if the word is guess correctly, then we 
        // need to clear the help pop-up
}

function validateGuess (
    { guess, answer, dispatcher, setShowAnswer }: validateGuessProps
): void{
    // check that the word the user entered corresponds to the answer
    if (guess.join('') === answer){
        // stop displaying the answer 
        setShowAnswer(false)

        dispatcher(incrementScore())     
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

interface PropsButtonValidateGuess{
    'formValue': string[], 
    'wordAndDefinition': {[key: string]: string}, 
    'dispatcher': Function, 
    'setShowAnswer': Function,
}

function ButtonValidateGuess({
    formValue, wordAndDefinition, dispatcher, setShowAnswer
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
    'formValue': string[], 
    'wordAndDefinition': {[key: string]: string}, 
    'dispatcher': Function,
    'setShowAnswer': Function,
    'showAnswer': boolean, 
}

function Buttons({
    formValue, wordAndDefinition, dispatcher, showAnswer, setShowAnswer, 
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
    'updateGuess': Function,
}

// TODO:
// gérer les espaces, gérer le nombre de lettres (ca marche plus à 19)
// mettre plus de mots, gérer si tout marche, mettre des espaces
function InputWithHint({nbLetters, updateGuess}: PropsInputWithHint): ReactNode{
    // several inputs aggregated together. Each input can only contain one letter
    // this makes it easier to guess the word

    // stupid hack: creating all the inputs, and hidding the useless ones...
    // this is the only way to work otherwise we get issues every time we refresh
    const nbInputs = 18
    
    const listRef: React.MutableRefObject<HTMLInputElement>[] = 
        Array(nbInputs).fill(null).map((elt) => useRef(elt))


    // the cell where we should type the letter
    let activeCell = 0
    let word = updateGuess('', activeCell)

    const handleFocus = () => {listRef[activeCell].current.focus()}
    const handleChange = (evt: KeyboardEvent) => {
        if((evt.key === "Backspace") || (evt.key === "Delete")){
            // case where we a deletion and the cell was already filled with a
            // value 
            if (word[activeCell]){
                // leave the cursor in the box
                word = updateGuess('', activeCell)
            }else{
                // move to the previous box
                activeCell = Math.max(0, activeCell - 1)

                // careful with the order of the focus
                handleFocus()
            }
        }else if((evt.key === ' ') || (evt.key === 'Enter')){
            // do nothing and erase what's in the cell 
        }else{
            word = updateGuess(evt.key, activeCell)
            // when we come back in cells already filled, we need to overwrite 
            // the value. Seems it's not done by default
            listRef[activeCell].current.value = evt.key

            // increment the counter and move to next cell
            activeCell = Math.min(activeCell + 1, nbLetters - 1)
            handleFocus()
        }   
    }
    const getClassName = (idx: number): string => {
        const className = (
            idx < nbLetters ? 'fw-bold text-center m-1': 'fw-bold text-center d-none'
        )
        return className
    }

    return(
        <div className='d-flex justify-content-center'>
            {listRef.map(
                (r, idx) => <input 
                    className={getClassName(idx)}
                    key={idx} 
                    size={1}
                    ref={r} 
                    maxLength={1}
                    onFocus={handleFocus}
                    onKeyUp={(evt) => handleChange(evt)}
                    value=''
            />)
            }
        </div>
    )
}
interface PropsMessage{
    score: number,
}
function Message({score}: PropsMessage): ReactNode{
    // display the message just for a certain amount of time
    const [isVisible, setIsVisible] = useState(true)

    useEffect(
        () => {setIsVisible(true)},
        [score]
    )

    setTimeout(() => setIsVisible(false), 1000)
    
    return(
        <Col className='d-flex justify-content-center'>
            <Fade in={isVisible}>
                <Button  variant="success">Bonne réponse !!</Button>
            </Fade>
        </Col>
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

    // do we show the answer card?
    let [showAnswer, setShowAnswer] = useState(false)

    const wordAndDef = getWord(user, randomStatus, dataset, score)
    const wordAndDefinition = {
        'toGuess': wordAndDef[0], 
        'definition': wordAndDef[1],
    }

    let guess = Array(wordAndDefinition.definition.length).fill('')
    const updateGuess = (letter: string, idx: number): string[] => {
        // contains the current guess of the user
        guess[idx] = letter
        return(guess)
    }

    return(
        <Container fluid>
            <Row className='mt-5 '/>

            <Message score={score}/>

            <WordToGuess wordAndDefinition={wordAndDefinition}/>

            <InputWithHint 
                nbLetters={guess.length}
                updateGuess={updateGuess}
            />

            <Buttons 
                formValue={guess}
                wordAndDefinition={wordAndDefinition}
                dispatcher={dispatcher}
                showAnswer={showAnswer}
                setShowAnswer={setShowAnswer}
            />
        </Container>
    )
}

export default Guess

