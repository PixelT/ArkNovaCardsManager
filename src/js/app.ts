import cards from '../data.json';

interface IConfig {
    [key: string]: string;
};

interface IDataStats {
    [key: number | string]: number;
}

(function() {
    const elForm: HTMLFormElement = document.querySelector(`.filter`);
    const elContentCards: HTMLDivElement = document.querySelector(`.content__cards`);
    const elContentStats: HTMLDivElement = document.querySelector(`.stats`);
    const elSearchField: HTMLInputElement = document.querySelector(`.action__search`);

    const config: IConfig = {
        cardsOnStorage: `anc_on`,
        cardsOffStorage: `anc_off`,
        cardsOnClass: `card--on`,
        cardsOffClass: `card--off`
    }

    let dataCards: Array<Number> = _getAnimalsID();
    let dataFilters: Object = {};
    let dataStats: IDataStats = _setStats();
    let matchingCards: number = 0;

    function _init(): void {
        _registerEvents();
        _displayCards(dataCards);
        _displayStats(dataStats);
    }

    function _registerEvents(): void {
        elSearchField && elSearchField.addEventListener(`input`, function() {
            let _value = this.value;

            if (_value.length > this.maxLength) {
                this.value = _value.slice(0, this.maxLength);
            }

            if (_value.length === 3 && (parseInt(_value) >= 401 && parseInt(_value) <= 526)) {
                const item = cards.animals.filter(obj => {
                    return obj[`id`] === parseInt(_value)
                });

                _collectStats([item[0].id]);
                _displayCards([parseInt(_value)]);
            } else {
                _collectCardsData(dataFilters);
                _collectStats(dataCards);
                _displayCards(dataCards);
            }

            _displayStats(dataStats);
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
                    _collectStats(dataCards);
                    _displayCards(dataCards);
                    _displayStats(dataStats);
                });

            } else if (el.classList.contains(`button--filter`)) {

                elSearchField.value = '';
                dataFilters = {};
                dataCards = _getAnimalsID();
                _displayCards(dataCards);

                dataStats = _setStats();
                _displayStats(dataStats);

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

            } else if (el.classList.contains(`toggle--nav`)) {

                el.closest(`.container__outer`).classList.toggle(`_active`);

            } else if (el.classList.contains(`toggle--stats`)) {

                el.closest(`.container__outer`).classList.toggle(`_active`);

            } else if (el.classList.contains(`action__item--scroll`)) {

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

            } else if (el.classList.contains(`action__item--search`)) {

                elSearchField.parentElement.classList.toggle(`action--active`);
                elSearchField.focus();
                
            }
        });
    }

    function _setStats(isDefault: boolean = true) {
        return {
            type_1: isDefault ? 25 : 0,
            type_2: isDefault ? 25 : 0,
            type_3: isDefault ? 25 : 0,
            type_4: isDefault ? 25 : 0,
            type_5: isDefault ? 18 : 0,
            area_1: isDefault ? 26 : 0,
            area_2: isDefault ? 19 : 0,
            area_3: isDefault ? 27 : 0,
            area_4: isDefault ? 20 : 0,
            area_5: isDefault ? 26 : 0,
            size_1: isDefault ? 33 : 0,
            size_2: isDefault ? 30 : 0,
            size_3: isDefault ? 24 : 0,
            size_4: isDefault ? 20 : 0,
            size_5: isDefault ? 19 : 0,
            aviary: isDefault ? 10 : 0,
            terrarium: isDefault ? 25 : 0,
            rock: isDefault ? 19 : 0,
            water: isDefault ? 23 : 0,
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

    function _collectStats(data: Array<Number>): void {
        dataStats = _setStats(false);

        data.forEach(elem => {
            const item = cards.animals.filter(obj => {
                return obj[`id`] === elem
            });

            if (item[0][`type`] != 0) {
                dataStats[`type_${item[0][`type`]}`]++;
            }

            if (item[0][`area`] != 0) {
                dataStats[`area_${item[0][`area`]}`]++;
            }

            if (item[0][`size`] != 0) {
                dataStats[`size_${item[0][`size`]}`]++;
            }
            
            item[0][`aviary`] ? dataStats[`aviary`]++ : '';
            item[0][`terrarium`] ? dataStats[`terrarium`]++ : '';
            item[0][`isRock`] ? dataStats[`rock`]++ : '';
            item[0][`isWater`] ? dataStats[`water`]++ : '';
        });
    }

    function _resetStats() {
        elContentStats.innerHTML = '';
    }

    function _displayStats(data: Object) {
        _resetStats();

        let markup = ``;
        const cards = +((matchingCards / 126) * 100).toFixed(1);

        
        Object.entries(data).forEach(([key, value]) => {
            const percentage = value ? +((value / matchingCards) * 100).toFixed(1) : 0;
            let itemClass: string = `stats__item`

            if (!value) {
                itemClass = `stats__item stats__item--empty`;
            }
            
            if (key == 'type_null' || key == 'area_null') {
                return;
            }
            
            markup += `
            <li class="${itemClass} icon icon--${key}" data-id="${key}">
                <span class="stats__label stats__label--cards">${value}x</span>
                <span class="stats__label stats__label--percentage">${percentage}%</span>
            </li>
            `
        });
        
        markup += `
            <li class="stats__item stats__item--cards icon icon--cards">
                <span class="stats__label stats__label--cards">${matchingCards}x</span>
                <span class="stats__label stats__label--percentage">${cards}%</span>
            </li>
        `

        elContentStats.innerHTML = markup;
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
        
        elContentCards.innerHTML = cardsMarkup ? cardsMarkup : _displayEmpty();
        matchingCards = Object.values(data).length;
    }

    function _displayEmpty(): string {
        return `<p class="content__empty">No matching cards found</p>`;
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