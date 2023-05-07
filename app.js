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
    }

    return results;
}

function searchById(people) {
    const idToSearchForString = prompt('Please enter the id of the person you are searching for.');
    const idToSearchForInt = parseInt(idToSearchForString);
    const idFilterResults = people.filter(person => person.id === idToSearchForInt);
    return idFilterResults;
}

function searchByName(people) {
    const firstNameToSearchFor = prompt('Please enter the the first name of the person you are searching for.');
    const lastNameToSearchFor = prompt('Please enter the the last name of the person you are searching for.');
    const fullNameSearchResults = people.filter(person => (person.firstName.toLowerCase() === firstNameToSearchFor.toLowerCase() && person.lastName.toLowerCase() === lastNameToSearchFor.toLowerCase()));
    return fullNameSearchResults;
}

function searchByTraits(people, depth = 0) {
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

    if (traitResults.length > 1) {
        if (depth === 4) {
            alert("You've reached the maximum number of traits to search by.");
            return traitResults;
        } else {
            const furtherRefine = validatedPrompt('More than one person found. Do you want to further refine the search?', ['yes', 'no']);
            if (furtherRefine.toLowerCase() === 'yes') {
            traitResults = searchByTraits(traitResults , depth +1);
            }
        }
      } else if (traitResults.length === 0) {
        alert('No results found.');
    }
    return traitResults;
}

function mainMenu(person, people) {

    const mainMenuUserActionChoice = validatedPrompt(
        `Person: ${person.firstName} ${person.lastName}\n\nDo you want to know their full information, family, or descendants?`,
        ['info', 'family', 'descendants', 'quit']
    );

    switch (mainMenuUserActionChoice) {
        case "info":
            displayPersonInfo(person, people);
            break;
        case "family":
            findPersonFamily(person, people);
            // displayPeople('Family', personFamily); Leaving this commmented out. Went with different implementation.
            break;
        case "descendants":
            let personDescendants = findPersonDescendants(person, people);
            displayPeople('Descendants', personDescendants);
            break;
        case "quit":
            return;
        default:
            alert('Invalid input. Please try again.');
    }

    return mainMenu(person, people);
}

function displayPeople(displayTitle, peopleToDisplay) {
    const formatedPeopleDisplayText = peopleToDisplay.map(person => `${person.firstName} ${person.lastName}`).join('\n');
    alert(`${displayTitle}\n\n${formatedPeopleDisplayText}`);
}

function displayPersonInfo(person, people) {
    const spouse = findSpouse (person, people);
    const parents = findParents (person, people);
    
    alert (`
    Name: ${person.firstName} ${person.lastName}
    Gender: ${person.gender}
    Date of Birth: ${person.dob}
    Height: ${person.height}
    Weight: ${person.weight}
    Eye Color: ${person.eyeColor}
    Occupation: ${person.occupation}
    Parents: ${parents}
    Current Spouse: ${spouse}`);
}


function findPersonFamily(person, people) {
    //Does not include offspring
    const spouse = findSpouse (person, people);
    const parents = findParents (person, people);
    const siblings = findSiblings (person, people);
    
    alert (`
    Name: ${person.firstName} ${person.lastName}
    Current Spouse: ${spouse}
    Parents: ${parents}
    Siblings: ${siblings}`);
}

function findSpouse (person, people) {
    let spouse = people.find(p => p.id === person.currentSpouse);
    spouse = spouse ? `${spouse.firstName} ${spouse.lastName}` : 'Not available'; //ternary operator to handle null spouse
    return spouse;
}

function findParents (person, people) {
    let parents = person.parents.map(parentId => people.find(p => p.id === parentId)); // Gets person object(s) from ID(s)
    let parentNames = parents.length > 0 ? parents.map(parent => `${parent.firstName} ${parent.lastName}`).join(', ') : 'Not available'; // Joins parent names, if any, into a string. Otherwise returns 'Not available'
    return parentNames;
}

function findSiblings (person, people) {
    let siblings = people.filter(p => p.parents === person.parents  && (p.firstName !== person.firstName || p.lastName !== person.lastName));
    let siblingNames = siblings.length > 0 ? siblings.map(sibling => `${sibling.firstName} ${sibling.lastName}`).join(', ') : 'Not available';
    return siblingNames;
}

function findPersonDescendants(person, people) {
    let descendants = [];
    const children = people.filter(p => p.parents.includes(person.id));

    children.forEach(child => { // Implicit base-case. Won't run if children is an empty array.
        descendants.push(child); // Adds current generation to descendants array
        descendants = descendants.concat(findPersonDescendants(child, people)); //Recursively adds next generation(s)
    });

    return descendants;
}


function validatedPrompt(message, acceptableAnswers) {
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
            return exitOrRestart(people);
    }
}