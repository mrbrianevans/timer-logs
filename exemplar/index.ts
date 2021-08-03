import Timer from '../index'

// instantiate the logger with some config values. The bare minimum is the filename
const timer = new Timer({filename: '/exemplar/index.ts', label: 'Examplary!', omitStackTrace: true})

// log a custom error without actually throwing Error
timer.customError('Hellp!')

// log any type of Error
try{
    JSON.parse('i am not json')
}catch (e) {
    timer.genericError(e)
}

// overriding the default error message in a promise .catch()
new Promise((resolve => setTimeout(resolve, 50)))
    .then(()=> {
        throw new Error('Unexpected error occured')
    }).catch(timer.genericErrorCustomMessage('A better explanation for what caused this error'))

const postgresExample = async () => {
    const { rows } = await new Promise((resolve => setTimeout(resolve, 50)))
        .then(()=> {
            throw new Error('Unexpected error occured')
            return {rows: ['row1', 'row2']}
        })
        .catch(timer.postgresErrorReturn({rows:[]}))
}
postgresExample().then(()=>{
    // always call flush at the end of the file (before the return statement) to print out the log
    timer.flush()
})
