import { create } from 'zustand'

interface Statement {
    id: number,
    statementType: string,
    attribute: string,
    deontic: string,
    aim: string,
    directObject: string,
    typeOfDirectObject: string,
    indirectObject: string,
    typeOfIndirectObject: string,
    activationCondition: string,
    executionConstraint: string,
    orElse: string,
}

type Store = {
    statements: Statement[]
}

export const useStore = create<Store>((set) => ({
    statements: [],
    setStatements: (statements: Statement[]) => set({ statements }),
}))
