"use client";
import { useEffect, useRef, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import Card from "../components/card";

type RectangleKey = "rectangle1" | "rectangle2" | "rectangle3";

type CardType = {
  id: string;
  title: string;
  description: string;
  rectangle: string;
};

export default function Home() {
  const [cards, setCards] = useState<Record<RectangleKey, CardType[]>>({
    rectangle1: [],
    rectangle2: [],
    rectangle3: [],
  });

  const [showForm, setShowForm] = useState(false);
  const [newCard, setNewCard] = useState<{
    title: string;
    description: string;
    rectangle: RectangleKey;
  }>({
    title: "",
    description: "",
    rectangle: "rectangle1",
  });

  const handleAddCardClick = (rectangle: keyof typeof cards) => {
    setShowForm(true);
    setNewCard({ title: "", description: "", rectangle });
  };

  const handleFormSubmit = () => {
    const newId = Date.now().toString();
    setCards((prevCards) => ({
      ...prevCards,
      [newCard.rectangle]: [
        ...prevCards[newCard.rectangle],
        { id: newId, title: newCard.title, description: newCard.description },
      ],
    }));
    setShowForm(false);
    setNewCard({ title: "", description: "", rectangle: "rectangle1" });
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    const sourceRectangle = source.droppableId as RectangleKey;
    const destinationRectangle = destination.droppableId as RectangleKey;

    const sourceCards = Array.from(cards[sourceRectangle]);
    const [movedCard] = sourceCards.splice(source.index, 1);

    const destinationCards = Array.from(cards[destinationRectangle]);
    destinationCards.splice(destination.index, 0, movedCard);

    setCards({
      ...cards,
      [sourceRectangle]: sourceCards,
      [destinationRectangle]: destinationCards,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-5xl font-bold mb-4">Kanban</h1>

        <div className="flex flex-row gap-10 h-full min-h-screen p-4 w-full">
          {(["rectangle1", "rectangle2", "rectangle3"] as RectangleKey[]).map(
            (rectangleKey) => (
              <DroppableRectangle
                key={rectangleKey}
                rectangleKey={rectangleKey}
                cards={cards[rectangleKey]}
                onAddCard={() => {
                  setShowForm(true);
                  setNewCard({
                    title: "",
                    description: "",
                    rectangle: rectangleKey,
                  });
                }}
              />
            )
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h3 className="text-lg font-bold mb-4">Adicionar Novo Card</h3>
              <input
                type="text"
                placeholder="Título"
                value={newCard.title}
                onChange={(e) =>
                  setNewCard({ ...newCard, title: e.target.value })
                }
                className="w-full mb-3 p-2 border border-gray-300 rounded"
              />
              <textarea
                placeholder="Descrição"
                value={newCard.description}
                onChange={(e) =>
                  setNewCard({ ...newCard, description: e.target.value })
                }
                className="w-full mb-3 p-2 border border-gray-300 rounded"
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-800 p-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFormSubmit}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}

type DroppableRectangleProps = {
  rectangleKey: RectangleKey;
  cards: CardType[];
  onAddCard: () => void;
};

function DroppableRectangle({
  rectangleKey,
  cards,
  onAddCard,
}: DroppableRectangleProps) {
  return (
    <Droppable droppableId={rectangleKey}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex-grow p-4 rounded-md shadow-md overflow-auto bg-gray-200`}
        >
          <h2 className="text-xl font-bold mb-4 bg-opacity-70 bg-gray-400 rounded w-full text-center">
            {rectangleKey === "rectangle1"
              ? "To do"
              : rectangleKey === "rectangle2"
              ? "Doing"
              : "Done"}
          </h2>
          {cards.map((card, index) => (
            <DraggableCard key={card.id} card={card} index={index} />
          ))}
          {provided.placeholder}
          <button
            onClick={onAddCard}
            className="mb-4 text-white p-2 rounded w-full bg-opacity-70 bg-blue-500"
          >
            Adicionar Card
          </button>
        </div>
      )}
    </Droppable>
  );
}

type DraggableCardProps = {
  card: CardType;
  index: number;
};

function DraggableCard({ card, index }: DraggableCardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 rounded-lg shadow-md mb-4 ${
            snapshot.isDragging ? "opacity-50" : "opacity-100"
          }`}
        >
          <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
          <p className="text-gray-700">{card.description}</p>
        </div>
      )}
    </Draggable>
  );
}
