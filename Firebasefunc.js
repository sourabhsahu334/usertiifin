import firestore from '@react-native-firebase/firestore';


export const getDocumentById = async (collectionName, docId) => {
    try {
      const doc = await firestore().collection(collectionName).doc(docId).get();
    //   console.log(doc)
      if (doc.exists) {
        return { id: doc.id, ...doc._data };
      } else {
        throw new Error('No such document!');
      }
    } catch (error) {
      console.error('Error fetching document: ', error);
      throw error;
    }
  };

  export const editDocumentWithId = async (collectionName, docId, updatedData) => {
    try {
      await firestore().collection(collectionName).doc(docId).update(updatedData);
      console.log('Document successfully updated!');
      return 1
    } catch (error) {
      console.error('Error updating document: ', error);
      return 0

    }
  };
  