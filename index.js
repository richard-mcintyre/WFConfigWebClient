import { Utils } from './utils.js';

const serverUrl = '192.168.1.21:5000';
const baseServerUrl = `https://${serverUrl}`;

const documentWellContainer = document.querySelector('#document-well-container');
const documentWell = document.querySelector('#document-well');
const treeContainer = document.querySelector('#treeContainer');
const tree = document.querySelector('#testele');
const headerBar = document.querySelector('#header-bar');

initialize();
resizeElements();

window.addEventListener('resize', resizeElements);

function resizeElements() {
    const height = window.visualViewport.height - headerBar.clientHeight;
    treeContainer.style.maxHeight = `${height}px`;
    treeContainer.style.height = `${height}px`;

    documentWellContainer.style.maxHeight = `${height}px`;
    documentWellContainer.style.height = `${height}px`;
}

async function initialize() {
    const response = await fetch(`${baseServerUrl}/api/life-cycle`);
    const lifeCycles = await response.json();
    
    initializeTree(lifeCycles);
}

async function initializeTree(lifeCycles) {
    for(let lifeCycle of lifeCycles) {
        tree.addItem({
            image: './images/lifecycle16x16.png',
            caption: lifeCycle.name,
            clickCallback: () => populateDocWell('lifeCycleType', lifeCycle),
            createChildrenCallback: lifeCycle.hasQueues ? addQueuesToTree : null,
            itemData: lifeCycle
        });
    }
}

async function addQueuesToTree(parent, lifeCycle) {
    const response = await fetch(`${baseServerUrl}/api/life-cycle/${lifeCycle.id}/queue`);
    const queues = await response.json();

    for(let queue of queues) {
        tree.addItem({
            caption: queue.name,
            clickCallback: () => populateDocWell('queueType', queue),
            createChildrenCallback: addQueueChildTreeItems,
            itemData: queue
        }, parent);
    }
}

function addQueueChildTreeItems(parent, queue) {
    tree.addItem({ 
        caption: 'System Work', 
        clickCallback: () => populateDocWell('sysworkType', null) ,
        createChildrenCallback: queue.systemWorkHasTasks ? addTaskListTaskTreeItems : null,
        itemData: { taskListId: queue.systemWorkId, queue }
    }, parent);

    tree.addItem({ 
        caption: 'User Work', 
        clickCallback: () => populateDocWell('userworkType', null) ,
        createChildrenCallback: queue.userWorkHasTasks ? addTaskListTaskTreeItems : null,
        itemData: { taskListId: queue.userWorkId, queue }
    }, parent);

    tree.addItem({ 
        caption: 'Ad Hoc Tasks', 
        clickCallback: () => populateDocWell('blank', null),
        createChildrenCallback: queue.hasAdHocTasks ? addAdHocTaskFolderTreeItems : null,
        itemData: queue
    }, parent);

    tree.addItem({ caption: 'Timers', clickCallback: () => populateDocWell('blank', null) }, parent);
    tree.addItem({ caption: 'Transitions', clickCallback: () => populateDocWell('blank', null) }, parent);
}

async function addAdHocTaskFolderTreeItems(parent, queue) {
    const response = await fetch(`${baseServerUrl}/api/life-cycle/${queue.lifeCycleId}/queue/${queue.id}/ad-hoc-task`);
    const adhocTasks = await response.json();

    for(let adhocTask of adhocTasks) {
        tree.addItem({
            image: './images/AdHocTask16x16.png',
            caption: adhocTask.name,
            clickCallback: () => populateDocWell('adhocTaskType', adhocTask),
            createChildrenCallback: adhocTask.hasTasks ? addTaskListTaskTreeItems : null,
            itemData: { taskListId: adhocTask.id, item: adhocTask }
        }, parent);
    }
}

async function addTaskListTaskTreeItems(parent, data) {
    const response = await fetch(`${baseServerUrl}/api/tasklist/${data.taskListId}/task`);
    const tasks = await response.json();

    for(let task of tasks) {
        let image = null;
        let fnCreateChildren = null;
        let docWellKind = 'blank';
        let itemData = task;

        if(task.kind === 'action') {
            image = './images/action16x16.png';
            docWellKind = 'actionType';
        } else if(task.kind === 'rule') {
            image = './images/rule16x16.png';
            docWellKind = 'ruleType';

            fnCreateChildren = (p, d) => {
                tree.addItem({
                    image: './images/ontruetasklist16x16.png',
                    caption: 'On True',
                    clickCallback: () => populateDocWell('ontrueorfalseTaskType', task),
                    createChildrenCallback: d.onTrueHasTasks ? addTaskListTaskTreeItems : null,
                    itemData: { taskListId: d.onTrueId, item: d.item }
                }, p);

                tree.addItem({
                    image: './images/onfalsetasklist16x16.png',
                    caption: 'On False',
                    clickCallback: () => populateDocWell('ontrueorfalseTaskType', task),
                    createChildrenCallback: d.onFalseHasTasks ? addTaskListTaskTreeItems : null,
                    itemData: { taskListId: d.onFalseId, item: d.item }
                }, p);                
            };
        } else if(task.kind === 'tasklist') {
            image = './images/tasklist16x16.png';
            docWellKind = 'tasklistType';

            fnCreateChildren = task.hasTasks ? addTaskListTaskTreeItems : null;
            itemData = { taskListId: task.id, item: task };
        }
            
        tree.addItem({
            image: image,
            caption: task.name,
            clickCallback: () => populateDocWell(docWellKind, task),
            createChildrenCallback: fnCreateChildren,
            itemData: itemData
        }, parent);
    }
}

function populateDocWell(configType, configuration) {

    Utils.removeAllChildNodes(documentWell);

    let configElement = null;
    if(configType === 'lifeCycleType') {
        configElement = document.createElement('life-cycle-configuration');
    } else if(configType === 'queueType') {
        configElement = document.createElement('queue-configuration');
    } else if(configType === 'actionType') {
        configElement = document.createElement('action-configuration');
    } else if(configType === 'ruleType') {
        configElement = document.createElement('rule-configuration');
    } else if(configType === 'tasklistType') {
        configElement = document.createElement('tasklist-configuration');
    } else if(configType === 'adhocTaskType') {
        configElement = document.createElement('adhoctask-configuration');
    } else if(configType === 'sysworkType') {
        configElement = document.createElement('systemwork-configuration');
    } else if(configType === 'userworkType') {
        configElement = document.createElement('userwork-configuration');
    } else if(configType === 'ontrueorfalseTaskType') {
        configElement = document.createElement('ontruefalse-configuration');
    }

    if(configElement) {
        const fnSetConfiguration = () => configElement.setAttribute('configuration', JSON.stringify(configuration));
        configElement.addEventListener('cancel', fnSetConfiguration);
        configElement.addEventListener('save', (e) => {
            console.log(e.detail);
        });
    
        fnSetConfiguration();
        documentWell.appendChild(configElement);
    }
}
