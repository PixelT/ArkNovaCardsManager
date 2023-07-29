import cards from '../data.json';

interface IConfig {
    [key: string]: string;
};

interface IDataSizes {
    [key: number | string]: number;
}

(function() {
    const elForm: HTMLFormElement = document.querySelector(`.filter`);
    const elContent: HTMLDivElement = document.querySelector(`.content__area`);
    const elSearchField: HTMLInputElement = document.querySelector(`.action__search`);
    const elNavbar: HTMLDivElement = document.querySelector(`.navbar`);

    const config: IConfig = {
        cardsOnStorage: `anc_on`,
        cardsOffStorage: `anc_off`,
        cardsOnClass: `card--on`,
        cardsOffClass: `card--off`
    }

    let dataCards: Array<Number> = _getAnimalsID();
    let dataFilters: Object = {};
    let dataSizes: IDataSizes = _setSizes();
    let matchingCards: number = 0;

    function _init(): void {
        _registerEvents();
        _displayCards(dataCards);
        _displaySizes(dataSizes);
    }

    function _registerEvents(): void {
        elSearchField && elSearchField.addEventListener(`input`, function() {
            let _value = this.value;

            if (_value.length > this.maxLength) {
                this.value = _value.slice(0, this.maxLength);
            }

            if (_value.length === 3 && (parseInt(_value) >= 401 && parseInt(_value) <= 526)) {
                _displayCards([parseInt(_value)]);
                _resetSizes();
            } else {
                _collectCardsData(dataFilters);
                _collectSizes(dataCards);
                _displayCards(dataCards);
                _displaySizes(dataSizes);
            }
        });

        document.addEventListener(`click`, (ev: Event) => {
            const el: HTMLElement = (ev.target as HTMLElement);

            if (el.classList.contains(`filter__label`) || el.classList.contains(`filter__text`)) {
                ev.preventDefault();

                let radioBox: any = undefined;

                if (el.classList.contains(`filter__text`)) {
                    radioBox = (ev.target as HTMLElement).parentElement.previousElementSibling;
                } else {
                    radioBox = (ev.target as HTMLElement).previousElementSibling;
                }
                
                radioBox.checked = !radioBox.checked;
                elSearchField.value = '';
                dataFilters = {};
    
                _promise().then(() => {
                    const formData: FormData = new FormData(elForm);

                    for (const [key, value] of formData) {
                        const objValue = isNaN(value as any) ? value : +value;

                        if (dataFilters.hasOwnProperty(key)) {
                            (dataFilters as any)[key].push(objValue);
                        } else {
                            Object.assign(dataFilters, {[key]: [objValue]});
                        }
                    }

                    _collectCardsData(dataFilters);
                    _collectSizes(dataCards);
                    _displayCards(dataCards);
                    _displaySizes(dataSizes);
                });

            } else if (el.classList.contains(`button--filter`)) {

                elSearchField.value = '';
                dataFilters = {};
                dataCards = _getAnimalsID();
                _displayCards(dataCards);

                dataSizes = _setSizes();
                _displaySizes(dataSizes);

            } else if (el.classList.contains(`button--cards`)) {

                ev.preventDefault();
                localStorage.setItem(config.cardsOnStorage, JSON.stringify([]));
                localStorage.setItem(config.cardsOffStorage, JSON.stringify([]));
                _displayCards(dataCards, true);

            } else if (el.classList.contains(`card__image`)) {

                ev.preventDefault();
                const card: HTMLElement = el.closest(`.card`);
                const cardID: number = parseInt(card.dataset.id);

                if (!card.classList.contains(config.cardsOffClass) && !card.classList.contains(config.cardsOnClass)) {

                    card.classList.add(config.cardsOnClass);
                    _addValueToStorage(config.cardsOnStorage, cardID);

                } else if (card.classList.contains(config.cardsOnClass)) {

                    card.classList.remove(config.cardsOnClass);
                    card.classList.add(config.cardsOffClass);
                    _removeValueFromStorage(config.cardsOnStorage, cardID);
                    _addValueToStorage(config.cardsOffStorage, cardID);

                } else if (card.classList.contains(config.cardsOffClass)) {

                    card.classList.remove(config.cardsOffClass);
                    _removeValueFromStorage(config.cardsOffStorage, cardID);
                }

            } else if (el.classList.contains(`nav__toggle`)) {

                el.closest(`.nav`).classList.toggle(`nav--active`);

            } else if (el.classList.contains(`action__item--scroll`)) {

                elContent.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

            } else if (el.classList.contains(`action__item--search`)) {

                elSearchField.parentElement.classList.toggle(`action--active`);
                
            }
        });
    }

    function _setSizes(reset: boolean = false) {
        return {
            1: reset ? 0 : 33,
            2: reset ? 0 : 30,
            3: reset ? 0 : 24,
            4: reset ? 0 : 20,
            5: reset ? 0 : 19,
            aviary: reset ? 0 : 10,
            terrarium: reset ? 0 : 25,
            rock: reset ? 0 : 19,
            water: reset ? 0 : 23,
        }
    }

    function _getAnimalsID(): Array<Number> {
        return cards.animals.sort((a, b) => {
            if (a.size < b.size) return 1;
            if (a.size > b.size) return -1;
            return 0;
        }).map(item => item[`id`]);
    }
    
    function _addValueToStorage(key: string, id: number) {
        const values = JSON.parse(localStorage.getItem(key)) || [];
        if (!values.includes(id)) values.push(id);
        localStorage.setItem(key, JSON.stringify(values));
    }

    function _removeValueFromStorage(key: string, id: number) {
        const values = JSON.parse(localStorage.getItem(key)) || [];
        if (values.includes(id)) values.splice(values.indexOf(id), 1);
        localStorage.setItem(key, JSON.stringify(values));
    }

    function _collectCardsData(data: Object): Array<Number> {
        if (!data) {
            dataCards = _getAnimalsID();
        } else {
            dataCards = [];

            Object.entries(cards.animals).forEach(element => {
                for (const property in data) {
                    if ((data[property as keyof typeof data] as any).includes((element[1] as any)[property])) {
                        (dataCards as Array<Number>).push(+element[1][`id`]);
                    }
                }
            });

            const activeFiltersType = Object.keys(data).length;

            if (!activeFiltersType) {
                dataCards = _getAnimalsID();
            }

            if (activeFiltersType > 1) {
                const dataFiltered = _filterData(activeFiltersType, dataCards as Array<Number>);

                dataFiltered.length ? dataCards = dataFiltered : dataCards = [];
            }
        }
        
        return dataCards;
    }

    function _collectSizes(data: Array<Number>): void {
        dataSizes = _setSizes(true);

        data.forEach(elem => {
            const item = cards.animals.filter(obj => {
                return obj[`id`] === elem
            });

            if (item[0][`size`] != 0) {
                dataSizes[item[0][`size`]]++;
            }
            
            item[0][`aviary`] ? dataSizes[`aviary`]++ : '';
            item[0][`terrarium`] ? dataSizes[`terrarium`]++ : '';
            item[0][`isRock`] ? dataSizes[`rock`]++ : '';
            item[0][`isWater`] ? dataSizes[`water`]++ : '';
        });
    }

    function _resetSizes() {
        elNavbar.innerHTML = '';
    }

    function _displaySizes(data: Object) {
        _resetSizes();

        let markup = ``;
        const cards = +((matchingCards / 126) * 100).toFixed(1);

        markup += `
            <li class="navbar__item navbar__item--cards icon icon--cards">
                <span class="navbar__label navbar__label--cards">${matchingCards}</span>
                <span class="navbar__label navbar__label--percentage">${cards}%</span>
            </li>
        `

        Object.entries(data).forEach(([key, value]) => {
            const percentage = +((value / matchingCards) * 100).toFixed(1);

            markup += `
                <li class="navbar__item icon icon--${key}" data-id="${key}">
                    <span class="navbar__label navbar__label--cards">${value}x</span>
                    <span class="navbar__label navbar__label--percentage">${percentage}%</span>
                </li>
            `
        });

        elNavbar.innerHTML = markup;
    }

    function _filterData(filters: number, data: Array<Number>): Array<Number> {
        const collection: Object = {};

        // @ts-ignore
        data.forEach(id => { collection[id] = (collection[id] || 0) + 1; });

        return Object.entries(collection).filter(value => {
            return +value[1] >= +filters;
        }).map((item: any) => +item[0]);
    }

    function _displayCards(data: Array<Number>, reload: boolean = false): void {        
        if ((data.length === matchingCards) && !reload) {
            return;
        }

        let cardsMarkup: string = '';

        for (const card in data) {
            cardsMarkup += _card((data as any)[card]);
        }
        
        elContent.innerHTML = cardsMarkup ? cardsMarkup : _displayEmpty();
        matchingCards = Object.values(data).length;
    }

    function _displayEmpty(): string {
        return `<p class="content__empty">No matching cards found</p>`
    }

    function _card(id: number): string {       
        let cardStatus = '';

        const cardsOn = JSON.parse(localStorage.getItem(config.cardsOnStorage));
        const cardsOff = JSON.parse(localStorage.getItem(config.cardsOffStorage));

        if (cardsOn && cardsOn.includes(+id)) {
            cardStatus = ` ${config.cardsOnClass}`;
        } else if (cardsOff && cardsOff.includes(+id)) {
            cardStatus = ` ${config.cardsOffClass}`;
        }

        return `
            <div class="card${cardStatus}" data-id="${id}">
                <img src="./dist/images/cards/${id}.jpg" class="card__image" loading="lazy" />
                <div class="card__id">${id}</div>
            </div>
        `;
    }

    function _promise(time: number = 0): Promise<Number> {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    _init();
}());