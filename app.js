"use strict"; // Not sure if needed, but adding

function app(people) {
    displayWelcome();
    runSearchAndMenu(people);
    return exitOrRestart(people);
}

function displayWelcome() {
    alert('Hello and welcome to the Most Wanted search application!');
}

function runSearchAndMenu(people) {
    const searchResults = searchPeopleDataSet(people);

    if (searchResults.length > 1) { // searchByTraits return
        displayPeople('Search Results', searchResults);
    }
    else if (searchResults.length === 1) { // searchByID/Name return, or a unique trait
        const person = searchResults[0];
        mainMenu(person, people);
    }
    else {
        alert('No one was found in the search.');
    }
}

function searchPeopleDataSet(people) {

    const searchTypeChoice = validatedPrompt(
        'Please enter in what type of search you would like to perform.',
        ['id', 'name', 'traits']
    );

    let results = [];
    switch (searchTypeChoice) {
        case 'id':
            results = searchById(people);
            break;
        case 'name':
            results = searchByName(people);
            break;
        case 'traits':
            results = searchByTraits(people);
            break;
        default:
            return searchPeopleDataSet(people);
            //Shouldn't be necessary after validatedPrompt, but restarts the function if the user somehow gets past the prompt. Good practice?
    }

    return results;
}

function searchById(people) {
    const idToSearchForString = prompt('Please enter the id of the person you are searching for.');
    const idToSearchForInt = parseInt(idToSearchForString);
    const idFilterResults = people.filter(person => person.id === idToSearchForInt);
    // Arrow function, returns person.id based on person (people element), then checks === to idToSearchForInt
    // find would be more efficient, right? Get first, then stop searching. filter continues.
    return idFilterResults;
}

function searchByName(people) {
    const firstNameToSearchFor = prompt('Please enter the the first name of the person you are searching for.');
    const lastNameToSearchFor = prompt('Please enter the the last name of the person you are searching for.');
    const fullNameSearchResults = people.filter(person => (person.firstName.toLowerCase() === firstNameToSearchFor.toLowerCase() && person.lastName.toLowerCase() === lastNameToSearchFor.toLowerCase()));
    return fullNameSearchResults;
}

function searchByTraits(people) {
    const traitToSearchFor = validatedPrompt('Please enter the trait you would like to search by.', ['gender', 'dob', 'height', 'weight', 'eyeColor', 'occupation']);
    let traitSpecifics = prompt(`Please enter the ${traitToSearchFor} you would like to search for.`);
    let traitResults;

    if (traitToSearchFor === 'height' || traitToSearchFor === 'weight') {
        traitSpecifics = parseInt(traitSpecifics);
        traitResults = people.filter(person => person[traitToSearchFor] === traitSpecifics);
    } else if (traitToSearchFor.toLowerCase() === 'eyecolor') {
        traitResults = people.filter(person => person.eyeColor === traitSpecifics);
    }
    else {
        traitResults = people.filter(person => person[traitToSearchFor]=== traitSpecifics);
    }
    return traitResults;
    // Working, but clunky. Probably a better way to handle eyeColor.
}

function mainMenu(person, people) {

    const mainMenuUserActionChoice = validatedPrompt(
        `Person: ${person.firstName} ${person.lastName}\n\nDo you want to know their full information, family, or descendants?`,
        ['info', 'family', 'descendants', 'quit']
    );

    switch (mainMenuUserActionChoice) {
        case "info":
            displayPersonInfo(person, people); //Okay to add (people) here, I'm assuming.
            break;
        case "family":
            //! TODO
            // let personFamily = findPersonFamily(person, people);
            // displayPeople('Family', personFamily);
            break;
        case "descendants":
            //! TODO
            // let personDescendants = findPersonDescendants(person, people);
            // displayPeople('Descendants', personDescendants);
            break;
        case "quit":
            return;
        default:
            alert('Invalid input. Please try again.');
    }

    return mainMenu(person, people);
    // Could technically lead to a stack overflow, though it would take a LOT of user inputs.
    // Good practice to avoid the possibility altogether anyway? Use while true loop instead?
}

function displayPeople(displayTitle, peopleToDisplay) {
    const formatedPeopleDisplayText = peopleToDisplay.map(person => `${person.firstName} ${person.lastName}`).join('\n');
    alert(`${displayTitle}\n\n${formatedPeopleDisplayText}`);
}

function displayPersonInfo(person, people) {
    let spouse = people.find(p => p.id === person.currentSpouse); // Just p to avoid repeating person (people element)
    spouse = spouse ? `${spouse.firstName} ${spouse.lastName}` : 'Not available'; //ternary operator to handle null spouse

    let parents = person.parents.map(parentId => people.find(p => p.id === parentId)); // Gets person object(s) from ID(s)
    let parentNames = parents.length > 0 ? parents.map(parent => `${parent.firstName} ${parent.lastName}`).join(', ') : 'Not available'; // Joins parent names, if any, into a string. Otherwise returns 'Not available'
    
    alert (`
    Name: ${person.firstName} ${person.lastName}
    Gender: ${person.gender}
    Date of Birth: ${person.dob}
    Height: ${person.height}
    Weight: ${person.weight}
    Eye Color: ${person.eyeColor}
    Occupation: ${person.occupation}
    Parents: ${parentNames}
    Current Spouse: ${spouse}`);
    // Could loop through the keys/values, but this allows formatting of the keys    
}


function findPersonFamily(person, people) {
    //TODO
}

function findPersonDescendants(person, people) {
    //TODO
}

function validatedPrompt(message, acceptableAnswers) {
    //Much better case-insensitivity than I made in the previous project
    acceptableAnswers = acceptableAnswers.map(aa => aa.toLowerCase());

    const builtPromptWithAcceptableAnswers = `${message} \nAcceptable Answers: ${acceptableAnswers.map(aa => `\n-> ${aa}`).join('')}`;

    const userResponse = prompt(builtPromptWithAcceptableAnswers).toLowerCase();

    if (acceptableAnswers.includes(userResponse)) {
        return userResponse;
    }
    else {
        alert(`"${userResponse}" is not an acceptable response. The acceptable responses include:\n${acceptableAnswers.map(aa => `\n-> ${aa}`).join('')} \n\nPlease try again.`);
        return validatedPrompt(message, acceptableAnswers);
    }
}

function exitOrRestart(people) {
    const userExitOrRestartChoice = validatedPrompt(
        'Would you like to exit or restart?',
        ['exit', 'restart']
    );

    switch (userExitOrRestartChoice) {
        case 'exit':
            return;
        case 'restart':
            return app(people);
        default:
            alert('Invalid input. Please try again.');
            return exitOrRestart(people); // Efficient error checking/input validation
    }
}