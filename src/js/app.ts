import cards from '../data.json';

interface IConfig {
    cardsOnStorage: string
    cardsOnClass: string
    cardsOffStorage: string
    cardsOffClass: string
};

(function() {
    const elForm: HTMLFormElement = document.querySelector(`.filter`);
    const elContent: HTMLDivElement = document.querySelector(`.content__area`);
    const elMatching: HTMLDivElement = document.querySelector(`.navbar__matching`);
    const elMatchingSpan: HTMLSpanElement = elMatching.querySelector(`span`);
    const elSearchField: HTMLInputElement = document.querySelector(`.navbar__input`);

    const config: IConfig = {
        cardsOnStorage: `anc_on`,
        cardsOffStorage: `anc_off`,
        cardsOnClass: `card--on`,
        cardsOffClass: `card--off`
    }
    
    let dataCards: Array<Number> = _getAnimalsID();
    let dataFilters: Object = {};
    let matchingCards: Number = 0;

    function _init(): void {
        _registerEvents();
        _displayCards(dataCards);
    }

    function _registerEvents(): void {
        elSearchField.addEventListener(`input`, function() {
            let _value = this.value;

            if (_value.length > this.maxLength) {
                this.value = _value.slice(0, this.maxLength);
            }

            if (_value.length === 3 && (parseInt(_value) >= 401 && parseInt(_value) <= 526)) {
                _displayCards([parseInt(_value)]);
            } else {
                _collectCardsData(dataFilters);
                _displayCards(dataCards);
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
                    _displayCards(dataCards);
                });

            } else if (el.classList.contains(`reset__button--filter`)) {

                elSearchField.value = '';
                dataFilters = {};
                dataCards = _getAnimalsID();
                _displayCards(dataCards);

            } else if (el.classList.contains(`reset__button--cards`)) {

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
            }
        });
    }

    function _getAnimalsID(): Array<Number> {
        return cards.animals.map(item => item[`id`]);
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

    function _filterData(filters: number, data: Array<Number>): Array<Number> {
        const collection: Object = {};
        
        // @ts-ignore
        data.forEach(id => { collection[id] = (collection[id] || 0) + 1; });

        return Object.entries(collection).filter(value => {
            return +value[1] >= +filters;
        }).map((item: any) => item[0]);
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
        (elMatchingSpan.innerHTML as any) = matchingCards;
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